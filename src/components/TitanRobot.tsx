import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface TitanRobotProps {
   buildState: 'sleeping' | 'waking' | 'building' | 'complete';
}

export function TitanRobot({ buildState }: TitanRobotProps) {
   const mountRef = useRef<HTMLDivElement>(null);
   const robotRef = useRef<any>(null);
   const sceneRef = useRef<THREE.Scene | null>(null);
   const hasWoken = useRef(false);

   useEffect(() => {
      if (!mountRef.current) return;

      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 0.5, 3); // closer view

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      // Ensure DOM is clean before appending (React 18 StrictMode fix)
      if (mountRef.current) {
         while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
         }
      }

      mountRef.current.appendChild(renderer.domElement);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const envScene = new THREE.Scene();
      
      const lightPlane1 = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      lightPlane1.position.set(0, 15, 0);
      lightPlane1.rotation.x = Math.PI / 2;
      envScene.add(lightPlane1);
      
      const lightPlane2 = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ color: 0xffffff })); // Brightened from ccffff
      lightPlane2.position.set(-15, 5, 15);
      lightPlane2.lookAt(0, 0, 0);
      envScene.add(lightPlane2);
      
      const envMap = pmremGenerator.fromScene(envScene).texture;
      scene.environment = envMap;

      // Lights
      const spotLight = new THREE.SpotLight(0xffffff, 10);
      spotLight.position.set(3, 6, 4);
      spotLight.angle = Math.PI / 4;
      spotLight.penumbra = 0.5;
      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 2048;
      spotLight.shadow.mapSize.height = 2048;
      spotLight.shadow.bias = -0.0001;
      scene.add(spotLight);

      const blueFill = new THREE.SpotLight(0x0a84ff, 8);
      blueFill.position.set(-3, 3, 3);
      blueFill.angle = Math.PI / 3;
      scene.add(blueFill);

      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambient);

      // Super sleek materials
      const robotBodyMat = new THREE.MeshPhysicalMaterial({
         color: 0x0f172a, // Dark slate
         metalness: 0.8,
         roughness: 0.2,
         clearcoat: 1.0,
         clearcoatRoughness: 0.1,
         envMapIntensity: 2.0,
      });

      const robotDarkMat = new THREE.MeshPhysicalMaterial({
         color: 0x000000, // True black skeleton
         metalness: 0.9,
         roughness: 0.4,
         clearcoat: 0.5,
         envMapIntensity: 1.0,
      });

      const robotGlassMat = new THREE.MeshPhysicalMaterial({
         color: 0xffffff,
         metalness: 0.1, 
         roughness: 0.1,
         opacity: 0.3,
         transparent: true,
         clearcoat: 1.0,
         envMapIntensity: 1.5,
      });
      
      const bones: any = {};
      const model = new THREE.Group();

      
      // Builder for highly detailed sleek body parts
      const createSleekPart = (radius: number, length: number, hasGlassShell: boolean = true) => {
         const group = new THREE.Group();
         
         // Inner dark skeleton
         const innerGeometry = new THREE.CapsuleGeometry(radius * 0.7, length, 16, 32);
         const innerMesh = new THREE.Mesh(innerGeometry, robotDarkMat);
         innerMesh.castShadow = true;
         innerMesh.receiveShadow = true;
         group.add(innerMesh);

         // Sleek white outer paneling (capsule)
         const outerGeometry = new THREE.CapsuleGeometry(radius, length * 0.9, 16, 32);
         const outerMesh = new THREE.Mesh(outerGeometry, robotBodyMat);
         outerMesh.castShadow = true;
         outerMesh.receiveShadow = true;
         // Cut out the center to reveal inner skeleton
         outerMesh.scale.x = 1.05;
         outerMesh.scale.z = 0.9; 
         group.add(outerMesh);

         if (hasGlassShell) {
            // Glass encapsulating shell
            const glassGeometry = new THREE.CapsuleGeometry(radius * 1.1, length * 1.05, 16, 32);
            const glassMesh = new THREE.Mesh(glassGeometry, robotGlassMat);
            group.add(glassMesh);
         }

         return group;
      };

      const createJoint = (radius: number) => {
         const jointGroup = new THREE.Group();
         
         const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), robotDarkMat);
         sphere.castShadow = true;
         jointGroup.add(sphere);

         const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.05, radius * 0.15, 16, 32), robotBodyMat);
         ring.rotation.x = Math.PI / 2;
         jointGroup.add(ring);

         return jointGroup;
      };

      // Construct Hierarchy
      const root = new THREE.Group(); // mixamorigHips
      model.add(root);
      bones['mixamorigHips'] = root;

      // Pelvis
      const pelvis = createSleekPart(0.2, 0.15);
      pelvis.rotation.z = Math.PI / 2;
      root.add(pelvis);

      // Spine/Torso
      const spineJoint = createJoint(0.18);
      root.add(spineJoint);

      const spine = createSleekPart(0.22, 0.4);
      spine.position.y = 0.3;
      spineJoint.add(spine);

      const chestJoint = createJoint(0.2);
      chestJoint.position.y = 0.3;
      spine.add(chestJoint);
      bones['mixamorigSpine'] = chestJoint; // using spine as major upper torso pivot

      const chest = createSleekPart(0.28, 0.3);
      chest.position.y = 0.25;
      chestJoint.add(chest);

      // Core light
      const coreLight = new THREE.PointLight(0xffffff, 2, 2);
      coreLight.position.z = 0.3;
      chest.add(coreLight);

      // Add a subtle glowing disc behind the robot, acting as an orbit ring or aura
      const auraGeom = new THREE.RingGeometry(0.8, 1.2, 64);
      const auraMat = new THREE.MeshBasicMaterial({ 
         color: 0x38bdf8, 
         transparent: true, 
         opacity: 0.15, 
         side: THREE.DoubleSide 
      });
      const aura = new THREE.Mesh(auraGeom, auraMat);
      aura.rotation.x = -Math.PI / 2;
      root.add(aura);

      // Neck and Head
      const neckJoint = createJoint(0.12);
      neckJoint.position.y = 0.25;
      chest.add(neckJoint);

      const headBone = new THREE.Group(); // mixamorigHead
      headBone.position.y = 0.1;
      neckJoint.add(headBone);
      bones['mixamorigHead'] = headBone;

      const head = createSleekPart(0.18, 0.1);
      head.position.y = 0.15;
      headBone.add(head);

      // Visor
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.1), robotDarkMat);
      visor.position.set(0, 0.18, 0.15);
      // smooth out visor
      const visorGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 32, 1, false, Math.PI, Math.PI);
      const visorMesh = new THREE.Mesh(visorGeom, new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0, metalness: 0.8, clearcoat: 1 }));
      visorMesh.rotation.y = Math.PI;
      visorMesh.position.set(0, 0.16, 0.05);
      headBone.add(visorMesh);

      // Arms
      const buildArm = (isLeft: boolean) => {
         const sign = isLeft ? 1 : -1;
         const shoulderNode = new THREE.Group();
         shoulderNode.position.set(sign * 0.35, 0.15, 0);
         chest.add(shoulderNode);

         const shoulderJoint = createJoint(0.15);
         shoulderNode.add(shoulderJoint);
         bones[isLeft ? 'mixamorigLeftArm' : 'mixamorigRightArm'] = shoulderJoint;

         const upperArm = createSleekPart(0.12, 0.4);
         upperArm.position.y = -0.25;
         shoulderJoint.add(upperArm);

         const elbowJoint = createJoint(0.12);
         elbowJoint.position.y = -0.25;
         upperArm.add(elbowJoint);
         bones[isLeft ? 'mixamorigLeftForeArm' : 'mixamorigRightForeArm'] = elbowJoint;

         const lowerArm = createSleekPart(0.1, 0.4);
         lowerArm.position.y = -0.25;
         elbowJoint.add(lowerArm);

         const wristGroup = createJoint(0.08);
         wristGroup.position.y = -0.25;
         lowerArm.add(wristGroup);
         
         const hand = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.15, 16, 16), robotDarkMat);
         hand.position.y = -0.1;
         wristGroup.add(hand);
      };

      buildArm(true);
      buildArm(false);

      // Legs
      const buildLeg = (isLeft: boolean) => {
         const sign = isLeft ? 1 : -1;
         const hipNode = new THREE.Group();
         hipNode.position.set(sign * 0.2, 0, 0);
         root.add(hipNode);

         const hipJoint = createJoint(0.18);
         hipNode.add(hipJoint);
         bones[isLeft ? 'mixamorigLeftUpLeg' : 'mixamorigRightUpLeg'] = hipJoint;

         const thigh = createSleekPart(0.16, 0.5);
         thigh.position.y = -0.35;
         hipJoint.add(thigh);

         const kneeJoint = createJoint(0.15);
         kneeJoint.position.y = -0.35;
         thigh.add(kneeJoint);
         bones[isLeft ? 'mixamorigLeftLeg' : 'mixamorigRightLeg'] = kneeJoint;

         const calf = createSleekPart(0.14, 0.5);
         calf.position.y = -0.35;
         kneeJoint.add(calf);

         const ankleGroup = createJoint(0.1);
         ankleGroup.position.y = -0.35;
         calf.add(ankleGroup);

         const foot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.3), robotBodyMat);
         foot.position.set(0, -0.05, 0.05);
         ankleGroup.add(foot);
      };

      buildLeg(true);
      buildLeg(false);

      // Initial Sleeping Pose horizontally
      const rootBone = bones['mixamorigHips'];
      if (rootBone) {
         rootBone.position.set(0, 0, 0); 
         // Lie down curled up sideways
         rootBone.rotation.set(-Math.PI / 6, Math.PI / 4, Math.PI / 2);
      }

      if (bones['mixamorigSpine']) {
         bones['mixamorigSpine'].rotation.set(0, 0, 0.2);
      }

      if (bones['mixamorigHead']) {
         bones['mixamorigHead'].rotation.set(0, 0, 0.5); 
      }
      
      // Both hands acting as pillow (folded)
      if (bones['mixamorigRightArm']) bones['mixamorigRightArm'].rotation.set(0, 0, -1.5);
      if (bones['mixamorigRightForeArm']) bones['mixamorigRightForeArm'].rotation.set(-2, 0, 0);
      
      if (bones['mixamorigLeftArm']) bones['mixamorigLeftArm'].rotation.set(0, 0, 1.5);
      if (bones['mixamorigLeftForeArm']) bones['mixamorigLeftForeArm'].rotation.set(-2, 0, 0);

      // Relaxed legs (curled up horizontally)
      if (bones['mixamorigLeftUpLeg']) bones['mixamorigLeftUpLeg'].rotation.set(-0.2, 0, 0);
      if (bones['mixamorigLeftLeg']) bones['mixamorigLeftLeg'].rotation.set(-0.5, 0, 0);
      
      if (bones['mixamorigRightUpLeg']) bones['mixamorigRightUpLeg'].rotation.set(-0.1, 0, 0);
      if (bones['mixamorigRightLeg']) bones['mixamorigRightLeg'].rotation.set(-0.4, 0, 0);

      model.scale.set(0.9, 0.9, 0.9);
      scene.add(model);

      robotRef.current = { model, bones, blueFill, coreLight };

      // Particles removed due to user request

      let frameId: number;
      const render = () => {
         renderer.render(scene, camera);
         frameId = requestAnimationFrame(render);
      };
      render();

      const handleResize = () => {
         if (!mountRef.current) return;
         const tw = mountRef.current.clientWidth;
         const th = mountRef.current.clientHeight;
         camera.aspect = tw / th;
         camera.updateProjectionMatrix();
         renderer.setSize(tw, th);
      };
      window.addEventListener('resize', handleResize);

      return () => {
         cancelAnimationFrame(frameId);
         window.removeEventListener('resize', handleResize);
         renderer.dispose();
         pmremGenerator.dispose();
         if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
            mountRef.current.removeChild(renderer.domElement);
         }
      };
   }, []);

   useEffect(() => {
      const { model, bones, blueFill } = robotRef.current || {};
      if (!model || !bones['mixamorigHips']) return;

      if ((buildState === 'waking' || buildState === 'building') && !hasWoken.current) {
         hasWoken.current = true;
         const tl = gsap.timeline();

         // 1. Wake core light pulses
         tl.to(blueFill, { intensity: 8, duration: 1, ease: "sine.inOut", yoyo: true, repeat: 1 });
         
         // 2. Levitate and rotate into standing / commanding pose
         tl.to(model.position, { y: 0.5, duration: 2.0, ease: "power3.inOut" }, 0);
         
         const root = bones['mixamorigHips'];
         tl.to(root.rotation, { x: 0, y: 0, z: 0, duration: 2.0, ease: "power3.inOut" }, 0);
         
         // Straighten legs
         tl.to([bones['mixamorigLeftUpLeg'].rotation, bones['mixamorigRightUpLeg'].rotation], { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.inOut" }, 0.5);
         tl.to([bones['mixamorigLeftLeg'].rotation, bones['mixamorigRightLeg'].rotation], { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.inOut" }, 0.5);

         // Lift arm to rub head
         tl.to(bones['mixamorigRightArm'].rotation, { x: 0, y: 0, z: -2.8, duration: 1.5, ease: "power3.out" }, 1);
         tl.to(bones['mixamorigRightForeArm'].rotation, { x: 0, y: 1.8, z: 0, duration: 1.5, ease: "power3.out" }, 1);
         
         // Left arm relaxes
         tl.to(bones['mixamorigLeftArm'].rotation, { x: 0, y: 0, z: 0.2, duration: 1.5, ease: "power3.out" }, 1.2);
         tl.to(bones['mixamorigLeftForeArm'].rotation, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power3.out" }, 1.2);

         // Head looks towards the rubbing hand slightly
         tl.to(bones['mixamorigHead'].rotation, { x: 0.2, y: -0.2, z: 0.1, duration: 1.0, ease: "power2.out" }, 1.5);
         
         // Rubbing head animation (wiggling hand)
         tl.to(bones['mixamorigRightForeArm'].rotation, { x: 0.2, y: 1.5, z: 0, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 3 }, 2.5);
         
         // Then point dynamically or lower arm
         tl.to(bones['mixamorigRightArm'].rotation, { x: 0.2, y: 0, z: 1.5, duration: 1.0, ease: "power2.inOut" }, 3.5);
         tl.to(bones['mixamorigRightForeArm'].rotation, { x: 0, y: -0.5, z: 0, duration: 1.0, ease: "power2.inOut" }, 3.5);
         tl.to(bones['mixamorigHead'].rotation, { x: 0.1, y: 0.3, z: -0.1, duration: 1.0, ease: "power1.inOut" }, 3.5);
         
         // Holding standing posture
         // Power down core light
         tl.to(blueFill, { intensity: 3, duration: 1.5, ease: "power1.out" }, 5.0);

      } else if (buildState === 'complete') {
         gsap.killTweensOf(model.position);
         // Vanishing animation is handled by css keyframes on the wrapper container
      }
   }, [buildState]);

   return (
      <div className="relative w-full h-[500px] flex items-center justify-center -mt-20">
         <div ref={mountRef} className="absolute inset-0 z-10"></div>
         {buildState === 'sleeping' && (
            <div className="absolute bottom-10 text-center z-20 opacity-80 bg-black/5 backdrop-blur-md px-6 py-2 rounded-full border border-black/10">
               <span className="text-[14px] tracking-[0.5em] text-gray-800 font-bold font-mono">NEXUS - DORMANT</span>
            </div>
         )}
      </div>
   );
}


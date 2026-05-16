import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Simplex Noise for the Shader
const _simplexNoiseShaderChunk = `
// Simplex 3D Noise 
// by Ian McEwan, Ashima Arts
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const vertexShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  ${_simplexNoiseShaderChunk}

  void main() {
    vNormal = normalize(normalMatrix * normal);
    
    // Add noise to vertices to create an organic, morphing effect
    float noise = snoise(position * 2.0 + uTime * 0.2);
    vec3 newPosition = position + normal * noise * 0.3; // Distort
    
    vPosition = newPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Ethereal Fresnel Effect (Rim lighting)
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnelTerm = dot(viewDirection, vNormal);
    fresnelTerm = clamp(1.0 - fresnelTerm, 0.0, 1.0);
    fresnelTerm = pow(fresnelTerm, 3.0); // Focus it on the edges

    // Base color: soft, almost white
    vec3 baseColor = vec3(0.98, 0.98, 0.99); 
    
    // Soft animated rainbow RGB based on time and position gradient
    vec3 a = vec3(0.85, 0.85, 0.85); // High brightness for pastel look
    vec3 b = vec3(0.35, 0.35, 0.35); // Soft contrast
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);
    
    float t = uTime * 0.3 + (vPosition.x + vPosition.y) * 0.15;
    vec3 rainbowColor = a + b * cos(6.28318 * (c * t + d));

    // Mix base with the rainbow fresnel
    vec3 finalColor = mix(baseColor, rainbowColor, fresnelTerm * 0.9);

    // Fade transparency at edges
    float alpha = mix(0.05, 0.85, fresnelTerm);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export default function Nexus3DBackground({ scrollContainerRef }: { scrollContainerRef?: React.RefObject<HTMLElement> }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    const baseBgConfig = new THREE.Color('#FAF9F6');
    const oceanBgConfig = new THREE.Color('#E0F5FF'); // Magical aquatic tint
    const bgColor = new THREE.Color('#FAF9F6');
    scene.background = bgColor;
    // THREE.FogExp2 matching the background color exactly
    scene.fog = new THREE.FogExp2(bgColor, 0.025);

    // CAMERA SETUP
    // Wide-angle camera perspectives (FOV 45-60) to emphasize scale
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

    // RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // cap pixel ratio to prevent throttling
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // LIGHTING SETUP
    // Low-contrast lighting rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // bright, cool-toned AmbientLight
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff0dd, 0.4); // soft
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xedf2f8, 0.3); // soft
    dirLight2.position.set(-5, 5, -5);
    scene.add(dirLight2);

    // HemisphereLight to simulate natural bounce
    const hemiLight = new THREE.HemisphereLight(0xedf2f8, 0xfceef5, 0.5); // sky color: soft blue, ground color: soft pink
    scene.add(hemiLight);

    // THE CENTER HERO OBJECT
    const heroGeometry = new THREE.IcosahedronGeometry(3, 32); // highly subdivided
    const heroMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      depthWrite: false, // Prevents z-fighting artifacts on transparent geometry
      blending: THREE.NormalBlending
    });
    const heroMesh = new THREE.Mesh(heroGeometry, heroMaterial);
    scene.add(heroMesh);

    // THE ENVIRONMENT: InstancedMesh for 1,000 instances
    const instanceCount = 1000;
    const debrisGeom = new THREE.TetrahedronGeometry(0.1, 1);
    const debrisMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      metalness: 0,
      roughness: 0.1,
      ior: 1.5,
      thickness: 0.1,
      transparent: true,
    });

    const instancedMesh = new THREE.InstancedMesh(debrisGeom, debrisMat, instanceCount);
    scene.add(instancedMesh);

    // Arrays to store procedural animation parameters
    const dummy = new THREE.Object3D();
    const offsets = new Float32Array(instanceCount * 3);
    const phases = new Float32Array(instanceCount);
    const speeds = new Float32Array(instanceCount);

    for (let i = 0; i < instanceCount; i++) {
       // Random positions in a wide torus-like field around the center
       const r = 6 + Math.random() * 20;
       const theta = Math.random() * Math.PI * 2;
       const phi = (Math.random() - 0.5) * Math.PI * 2;

       const x = r * Math.cos(theta) * Math.cos(phi);
       const y = r * Math.sin(phi);
       const z = r * Math.sin(theta) * Math.cos(phi);

       offsets[i * 3 + 0] = x;
       offsets[i * 3 + 1] = y;
       offsets[i * 3 + 2] = z;

       phases[i] = Math.random() * Math.PI * 2;
       speeds[i] = 0.2 + Math.random() * 0.5;

       dummy.position.set(x, y, z);
       
       // Initial random rotation
       dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
       
       // Random scale
       const scale = 0.5 + Math.random();
       dummy.scale.set(scale, scale, scale);
       
       dummy.updateMatrix();
       instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    
    instancedMesh.instanceMatrix.needsUpdate = true;

    // --- WATER PLANE ---
    const waterGeo = new THREE.PlaneGeometry(150, 150, 16, 16);
    const waterPos = waterGeo.attributes.position;
    const waterMat = new THREE.MeshBasicMaterial({
      color: 0x00c8ff,
      opacity: 0.15, 
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    scene.add(waterMesh);

    // --- BUBBLES ---
    const bubbleCount = 30;
    const bubbleGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const bubbleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0, 
      depthWrite: false
    });
    const bubbleInstanced = new THREE.InstancedMesh(bubbleGeo, bubbleMat, bubbleCount);
    scene.add(bubbleInstanced);

    const bubbleData: any[] = [];
    for(let i=0; i<bubbleCount; i++) {
        bubbleData.push({
            x: (Math.random() - 0.5) * 40,
            y: -20 + Math.random() * 40,
            z: (Math.random() - 0.5) * 40,
            speed: 0.05 + Math.random() * 0.05,
            wobbleSpeed: 1 + Math.random() * 3,
            wobbleSize: Math.random() * 0.2
        });
    }

    // --- FISHES ---
    const fishCount = 10;
    const fishGeo = new THREE.ConeGeometry(0.08, 0.4, 4);
    fishGeo.rotateX(Math.PI / 2); // Point forward
    const fishMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0,
    });
    const fishInstanced = new THREE.InstancedMesh(fishGeo, fishMat, fishCount);
    scene.add(fishInstanced);

    const fishData: any[] = [];
    for(let i=0; i<fishCount; i++) {
        fishData.push({
            radius: 4 + Math.random() * 15,
            angle: Math.random() * Math.PI * 2,
            height: -15 + Math.random() * 15,
            speed: 0.2 + Math.random() * 0.5,
            yOffset: Math.random() * Math.PI * 2,
        });
    }

    // MOUSE PARALLAX SETUP
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
       mouseX = (event.clientX - windowHalfX) * 0.002;
       mouseY = (event.clientY - windowHalfY) * 0.002;
    };
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    // RESIZE LOGIC
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize, false);

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    let heroRotY = 0;
    let heroRotX = 0;
    let lastScrollY = 0;
    let smoothVelocity = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta(); // Time elapsed since last frame

      // Calculate scroll progress & velocity
      let currentScrollY = 0;
      let scrollProgress = 0;
      if (scrollContainerRef && scrollContainerRef.current) {
         currentScrollY = scrollContainerRef.current.scrollTop;
         scrollProgress = currentScrollY / (scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight || 1);
      } else {
         currentScrollY = window.scrollY;
         scrollProgress = currentScrollY / (document.body.scrollHeight - window.innerHeight || 1);
      }
      
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);
      lastScrollY = currentScrollY;
      smoothVelocity += (scrollDelta - smoothVelocity) * 0.1;

      // Update shader uniform
      heroMaterial.uniforms.uTime.value = elapsedTime;

      // Rotate Hero Object (Base + Velocity-induced fast spin)
      heroRotY += (0.2 + smoothVelocity * 0.02) * Math.min(delta, 0.1); 
      heroRotX += (0.1 + smoothVelocity * 0.01) * Math.min(delta, 0.1);
      heroMesh.rotation.y = heroRotY;
      heroMesh.rotation.x = heroRotX;

      // Update Instanced Debris
      for (let i = 0; i < instanceCount; i++) {
        const x = offsets[i * 3 + 0];
        const y = offsets[i * 3 + 1];
        const z = offsets[i * 3 + 2];
        
        const currentPhase = phases[i];
        const speed = speeds[i];

        // Complex trigonometric drift simulation
        dummy.position.set(
          x + Math.sin(elapsedTime * speed + currentPhase) * 1.5,
          y + Math.cos(elapsedTime * speed * 0.8 + currentPhase) * 1.5,
          z + Math.sin(elapsedTime * speed * 0.5 + currentPhase) * 1.5
        );

        dummy.rotation.x += 0.005 * speed;
        dummy.rotation.y += 0.01 * speed;
        
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;

      // Camera parallax tracking and gentle breathing
      targetX = mouseX * 2;
      targetY = mouseY * 2;
      
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;

      // Dramatic Cinematic Scroll Animation (3D response)
      // Moving forward on Z axis based on scroll, plus gentle breathing
      const targetZ = 15 - (scrollProgress * 12); // Move closer deeply
      camera.position.z += (targetZ - camera.position.z) * 0.05;
      camera.position.z += Math.sin(elapsedTime * 0.2) * 0.01; // subtle breath on top of scroll
      
      // Let's organically twist the entire environment around the user as they scroll
      const targetRotationY = scrollProgress * Math.PI * 0.8; // 144 degree twist over the whole scroll
      const targetRotationX = scrollProgress * Math.PI * 0.2; // 36 degree pitch offset
      
      scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.05;
      scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.05;

      // --- OCEAN WAVE TRANSITION ---
      // Water sweeps up as you scroll, passing from below the camera (-20) to above (+10)
      waterMesh.position.y = -20 + (scrollProgress * 40);
      
      const time = elapsedTime * 1.5;
      for(let i = 0; i < waterPos.count; i++) {
          const x = waterPos.getX(i);
          const y = waterPos.getY(i);
          // Combine low and high frequency sine waves for an organic ocean surface
          const z = Math.sin(x * 0.15 + time) * Math.cos(y * 0.15 + time * 0.8) * 1.5 
                  + Math.sin(x * 0.05 - time * 0.5) * 1.0;
          waterPos.setZ(i, z);
      }
      waterPos.needsUpdate = true;

      // Fade background to slightly blue
      const blendFactor = Math.min(1, Math.max(0, scrollProgress * 1.5 - 0.2));
      bgColor.copy(baseBgConfig).lerp(oceanBgConfig, blendFactor);
      scene.background = bgColor;
      if (scene.fog) {
        scene.fog.color.copy(bgColor);
      }

      const oceanOpacity = Math.min(1, Math.max(0, scrollProgress * 3 - 0.6));
      bubbleMat.opacity = oceanOpacity;
      fishMat.opacity = oceanOpacity;

      // Update Bubbles
      for(let i=0; i<bubbleCount; i++) {
          const b = bubbleData[i];
          b.y += (b.speed + smoothVelocity * 0.001); // Bubbles rise faster on scroll
          if(b.y > 15) b.y = -20;
          const wobbleX = b.x + Math.sin(elapsedTime * b.wobbleSpeed) * b.wobbleSize;
          dummy.position.set(wobbleX, b.y, b.z);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          bubbleInstanced.setMatrixAt(i, dummy.matrix);
      }
      bubbleInstanced.instanceMatrix.needsUpdate = true;

      // Update Fishes
      for(let i=0; i<fishCount; i++) {
          const f = fishData[i];
          f.angle += f.speed * delta;
          const fx = Math.cos(f.angle) * f.radius;
          const fz = Math.sin(f.angle) * f.radius;
          const fy = f.height + Math.sin(elapsedTime * f.speed + f.yOffset) * 1.0;
          
          dummy.position.set(fx, fy, fz);
          
          // Tangent to circle for looking direction
          const tx = Math.cos(f.angle + 0.1) * f.radius;
          const tz = Math.sin(f.angle + 0.1) * f.radius;
          dummy.lookAt(tx, fy, tz);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          fishInstanced.setMatrixAt(i, dummy.matrix);
      }
      fishInstanced.instanceMatrix.needsUpdate = true;

      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // DISPOSAL LOGIC
    return () => {
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      
      heroGeometry.dispose();
      heroMaterial.dispose();
      debrisGeom.dispose();
      debrisMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      bubbleGeo.dispose();
      bubbleMat.dispose();
      fishGeo.dispose();
      fishMat.dispose();
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0" />;
}

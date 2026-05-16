import React, { useState, useEffect, useRef, useCallback } from 'react';
import Konva from 'konva';
import { Stage, Layer, Line, Rect, Circle, Group, Image, Path, Text, Transformer, Shape } from 'react-konva';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getStroke } from 'perfect-freehand';
import { 
  ArrowLeft, Brush, Eraser, Move, Undo2, Redo2, Download, Layers, Settings,
  Pipette, Maximize, MousePointer2, Plus, ArrowDownToLine, Trash2, Sliders, Play, Eye, EyeOff, Grid3X3,
  PaintBucket, MousePointer, Type, SquareDashed, CircleDashed, LassoSelect, ArrowUp, ArrowDown, Scissors,
  Circle as CircleIcon, SlidersHorizontal, Hand, Image as ImageIcon, RefreshCw, ChevronUp, Lock, CornerDownRight, Menu, Copy, FlipHorizontal, FlipVertical, Camera, Box, X, Sparkles, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MANGA_FRAMES } from '../../lib/mangaFrames';
import { Client } from '@gradio/client';
import '@google/model-viewer';

export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"] as any[]
  );
  d.push("Z");
  return d.join(" ");
}

const BRUSHES = [
  'Dip Pen (Hard)', 'Felt Tip Pen (Soft)', 'Airbrush (Normal)',
  'Genius Pen', 'Love Pen', 'Mapping Pen', 'G-Pen',
  'Flat Brush (Dry)', 'Oil Brush (Rough)', 'Charcoal', 'Pencil (HB)',
  'Technical Pen', 'Calligraphy Pen', 'Watercolor (Bleed)', 'Watercolor (Opaque)',
  'Acrylic', 'Gouache', 'Digital Pen', 'Pencil (Graphite)', 'Soft Pastel',
  'Dip Pen (Soft)', 'G-Pen (Bleed)', 'Ink Pen (Rough)', 'Marker (Broad)', 'Felt Tip Pen (Hard)',
  'Pencil (2B)', 'Watercolor (Wet)', 'Oil Brush (Flat)', 'Airbrush (Particle)', 'Stipple Pen',
  'Hatching Brush', 'Glass Pen (Smooth)', 'Texture Brush (Noise)', 'Calligraphy Brush (Flat)', 'Technical Liner'
];

const BLEND_MODES = [
  'source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 
  'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 
  'exclusion', 'hue', 'saturation', 'color', 'luminosity', 'destination-over', 
  'destination-in', 'destination-out', 'destination-atop', 'source-in', 
  'source-out', 'source-atop', 'lighter', 'copy', 'xor',
  'linear-burn', 'linear-dodge', 'vivid-light', 'linear-light', 'pin-light', 
  'hard-mix', 'subtract', 'divide', 'add', 'darker-color', 
  'lighter-color', 'glow', 'reflect', 'glow-dodge', 'freeze', 'heat', 
  'interpolate', 'negation', 'phoenix', 'dodge', 'burn', 'average', 'grain-merge', 'grain-extract'
];

type Point = { x: number; y: number };

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}

type DrawingLine = {
  id?: string;
  tool: 'brush' | 'eraser';
  points: number[];
  color: string;
  size: number;
  opacity: number;
  tension: number;
  layerId: string;
  globalCompositeOperation?: GlobalCompositeOperation;
  thinning?: number;
  smooth?: boolean;
  lineCap?: string;
  lineJoin?: string;
  type?: string;
  imageType?: string;
  imageDataObject?: string;
  x?: number;
  y?: number;
  rotation?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
};

type AppLayer = {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  locked: boolean;
  alphaLock?: boolean;
  clipping?: boolean;
};

type DrawingText = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
  rotation: number;
  scaleX: number;
  scaleY: number;
  layerId: string;
};

const ImageLine = React.forwardRef(({ line, tool, onSelect, onUpdate }: { line: DrawingLine & { id?: string }, tool?: string, onSelect?: () => void, onUpdate?: (line: any) => void }, ref: any) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const i = new window.Image();
    i.src = line.imageDataObject!;
    i.onload = () => setImg(i);
  }, [line.imageDataObject]);
  
  if (img) {
    return (
      <Image 
        id={line.id}
        ref={ref}
        image={img} 
        x={line.x || 0}
        y={line.y || 0}
        rotation={line.rotation || 0}
        scaleX={line.scaleX || 1}
        scaleY={line.scaleY || 1}
        width={line.width || img.width}
        height={line.height || img.height}
        globalCompositeOperation={line.globalCompositeOperation} 
        opacity={line.opacity} 
        draggable={tool === 'transform'}
        onClick={() => { if (tool === 'transform' && onSelect) onSelect(); }}
        onTap={() => { if (tool === 'transform' && onSelect) onSelect(); }}
        onDragEnd={(e) => {
          if (onUpdate) {
            onUpdate({ ...line, x: e.target.x(), y: e.target.y() });
          }
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          if (onUpdate) {
            onUpdate({
              ...line,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY)
            });
          }
        }}
      />
    );
  }
  return null;
});

const MemoizedPath = React.memo(React.forwardRef(({ line, tool, onSelect, onUpdate }: { line: DrawingLine & { id?: string }, tool?: string, onSelect?: () => void, onUpdate?: (line: any) => void }, ref: any) => {
  if (line.type === 'image' && line.imageType === 'base64' && line.imageDataObject) {
    return <ImageLine line={line} tool={tool} onSelect={onSelect} onUpdate={onUpdate} ref={ref} />;
  }

  const pathData = React.useMemo(() => {
    if (line.points.length > 4 && line.smooth) {
      const pointArray = [];
      for (let i = 0; i < line.points.length; i += 2) {
        pointArray.push([line.points[i], line.points[i + 1]]);
      }
      const stroke = getStroke(pointArray, {
        size: line.size,
        thinning: line.thinning || 0.5,
        smoothing: line.tension || 0.5,
        streamline: 0.5,
      });
      return getSvgPathFromStroke(stroke);
    }
    return null;
  }, [line.points, line.size, line.smooth, line.thinning, line.tension]);

  if (pathData) {
    return (
      <Path
        ref={ref}
        data={pathData}
        fill={line.tool === 'eraser' ? 'rgba(0,0,0,1)' : line.color}
        globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : line.globalCompositeOperation}
        opacity={line.opacity}
      />
    );
  }

  // Fallback to basic Line
  return (
    <Line
      ref={ref}
      points={line.points}
      stroke={line.color}
      strokeWidth={line.size}
      tension={line.tension}
      lineCap="round"
      lineJoin="round"
      globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : line.globalCompositeOperation}
      opacity={line.opacity}
    />
  );
}));

export default function ClipperStudio({ id, onClose, initialImage, targetWidth, targetHeight, clipPath, onSaveToManga }: { id: string | undefined, onClose: () => void, initialImage?: string, targetWidth?: number, targetHeight?: number, clipPath?: string, onSaveToManga?: (dataUrl: string) => void }) {
  const [searchParams] = useSearchParams();
  const frameId = searchParams.get('frameId');
  const navigate = useNavigate();

  const { canvasWidth, canvasHeight } = React.useMemo(() => {
    const w = targetWidth || parseInt(searchParams.get('width') || '2480');
    const h = targetHeight || parseInt(searchParams.get('height') || '3508');
    return { canvasWidth: w, canvasHeight: h };
  }, [targetWidth, searchParams]);

  const [lines, setLines] = useState<DrawingLine[]>([]);
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null);
  const [texts, setTexts] = useState<DrawingText[]>([]);
  const [history, setHistory] = useState<DrawingLine[][]>([]);
  const [historyStep, setHistoryStep] = useState(0);

  const [tool, setTool] = useState<'brush' | 'eraser' | 'move' | 'text' | 'eyedropper'>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [brushTension, setBrushTension] = useState(0.5);
  const [brushThinning, setBrushThinning] = useState(0.5);
  const [brushFadeStart, setBrushFadeStart] = useState(0);
  const [brushFadeEnd, setBrushFadeEnd] = useState(0);
  const [brushBlendMode, setBrushBlendMode] = useState('source-over');
  const [selectedBrush, setSelectedBrush] = useState(BRUSHES[0]);

  useEffect(() => {
     let size = brushSize;
     let opacity = 1;
     let tension = 0.5;
     let thinning = 0.5;
     let fadeStart = 0;
     let fadeEnd = 0;
     let blend = 'source-over';

     if (selectedBrush.includes('Pen')) { opacity = 1; tension = 0.6; thinning = 0.7; fadeStart = 2; fadeEnd = 20; }
     else if (selectedBrush.includes('Soft')) { opacity = 0.6; tension = 0.8; thinning = 0.3; fadeStart = 20; fadeEnd = 20; }
     else if (selectedBrush.includes('Hard')) { opacity = 1; tension = 0.2; thinning = 0; fadeStart = 0; fadeEnd = 0; }
     else if (selectedBrush.includes('Bleed')) { opacity = 0.8; size = Math.max(15, size); thinning = -0.5; fadeStart = 0; fadeEnd = 100; }
     else if (selectedBrush.includes('Fade')) { opacity = 0.5; thinning = 0.5; fadeStart = 100; fadeEnd = 100; }
     else if (selectedBrush.includes('Water')) { opacity = 0.3; size = Math.max(20, size); blend = 'multiply'; thinning = 0.1; fadeStart = 50; fadeEnd = 50; }
     else if (selectedBrush.includes('Airbrush')) { opacity = 0.2; size = Math.max(40, size); thinning = 0; fadeStart = 100; fadeEnd = 100; }
     else if (selectedBrush.includes('Pencil')) { opacity = 0.7; size = Math.max(2, size); tension = 0.1; thinning = 0; fadeStart = 10; fadeEnd = 10; }
     else if (selectedBrush.includes('Genius')) { opacity = 1; tension = 0.5; thinning = 0.8; fadeStart = 0; fadeEnd = 5; }
     else if (selectedBrush.includes('Love')) { opacity = 0.9; tension = 0.7; thinning = 0.4; fadeStart = 5; fadeEnd = 15; }
     else if (selectedBrush.includes('Charcoal')) { opacity = 0.6; size = Math.max(10, size); tension = 0.2; thinning = -0.2; }
     else if (selectedBrush.includes('Acrylic')) { opacity = 0.9; size = Math.max(12, size); tension = 0.4; thinning = 0.1; }
     else if (selectedBrush.includes('Gouache')) { opacity = 0.8; size = Math.max(15, size); tension = 0.3; thinning = 0.2; }
     else if (selectedBrush.includes('Graphite')) { opacity = 0.5; size = Math.max(3, size); tension = 0.1; thinning = 0; }
     else if (selectedBrush.includes('Technical')) { opacity = 1; tension = 0.4; thinning = 0.2; fadeStart = 0; fadeEnd = 0; }
     else if (selectedBrush.includes('Mapping')) { opacity = 1; tension = 0.3; thinning = 0.9; fadeStart = 0; fadeEnd = 0; }
     else if (selectedBrush.includes('G-Pen')) { opacity = 1; tension = 0.4; thinning = 0.85; fadeStart = 0; fadeEnd = 10; }
     else if (selectedBrush.includes('Flat')) { opacity = 0.8; size = Math.max(15, size); thinning = 0.1; blend = 'multiply'; }
     else if (selectedBrush.includes('Oil')) { opacity = 0.9; size = Math.max(20, size); tension = 0.6; thinning = 0; }
     else if (selectedBrush.includes('Calligraphy')) { opacity = 1; tension = 0.1; thinning = 0.9; fadeStart = 0; fadeEnd = 2; }
     else if (selectedBrush.includes('Opaque')) { opacity = 1; size = Math.max(10, size); thinning = 0.2; }
     else if (selectedBrush.includes('Digital')) { opacity = 1; tension = 0.1; thinning = 0; fadeStart = 0; fadeEnd = 0; }
     else if (selectedBrush.includes('Pastel')) { opacity = 0.4; size = Math.max(25, size); thinning = -0.1; tension = 0.8; }
     else if (selectedBrush.includes('Felt Tip')) { opacity = 0.9; size = Math.max(2, size); thinning = 0.3; }
     else if (selectedBrush.includes('Marker')) { opacity = 0.7; size = Math.max(8, size); thinning = 0.1; blend = 'multiply'; }
     else if (selectedBrush.includes('Hatching')) { opacity = 1; size = 2; thinning = 0; tension = 0; }
     else if (selectedBrush.includes('Glass')) { opacity = 0.9; size = 1.5; thinning = 0.8; tension = 0.1; }
     else if (selectedBrush.includes('Stipple')) { opacity = 0.6; size = Math.max(5, size); thinning = -0.5; tension = 0.9; }
     else if (selectedBrush.includes('Liner')) { opacity = 1; size = 1; thinning = 0.1; tension = 0.2; }
     else if (selectedBrush.includes('Noise')) { opacity = 0.5; size = Math.max(12, size); thinning = 0; tension = 0.95; }
     
     setBrushSize(size);
     setBrushOpacity(opacity);
     setBrushTension(tension);
     setBrushThinning(thinning);
     setBrushFadeStart(fadeStart);
     setBrushFadeEnd(fadeEnd);
     setBrushBlendMode(blend);
  }, [selectedBrush]);
  const [activePanel, setActivePanel] = useState<'layers' | 'colors' | 'brush' | 'layer_blend' | 'brush_blend' | 'tools' | 'text_edit' | null>(null);
  const [activeBlendLayerId, setActiveBlendLayerId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const [layers, setLayers] = useState<AppLayer[]>([
    { id: 'layer1', name: 'Layer 1', visible: true, opacity: 1, blendMode: 'source-over', locked: false, alphaLock: false },
    { id: 'layer_bg', name: 'Background', visible: true, opacity: 1, blendMode: 'destination-over', locked: true }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer1');

  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  const [previewDataURL, setPreviewDataURL] = useState<string | null>(null);

  const [show3DModal, setShow3DModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStyle, setAiStyle] = useState("manga lineart, black and white manga page style, ink drawing, highly detailed, masterwork");
  const [aiModel, setAiModel] = useState("cagliostrolab/animagine-xl-3.1");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState("");
  const [modelSelection, setModelSelection] = useState<"trellis" | "hunyuan">("trellis");
  const [withTextures, setWithTextures] = useState(true);
  const [hfToken, setHfToken] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [glbUrl, setGlbUrl] = useState("");
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [show3DViewerInCanvas, setShow3DViewerInCanvas] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const [showMesh, setShowMesh] = useState(false);
  const [meshPoints, setMeshPoints] = useState<any[]>([]);
  const [stabilizerEnabled, setStabilizerEnabled] = useState(true);

  const marchingAntsRef = useRef<any>(null);
  
  useEffect(() => {
    if (activePanel === 'layers' && stageRef.current) {
        try {
            const dataUrl = stageRef.current.toDataURL({ pixelRatio: 0.2 });
            setPreviewDataURL(dataUrl);
        } catch (err) {
            console.error(err);
        }
    }
  }, [activePanel]);

  const lastAngleRef = useRef<number | null>(null);
  const isDrawingRef = useRef(false);
  const [isDrawingUI, setIsDrawingUI] = useState(false);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  
  useEffect(() => {
    if (selectedNodeId && trRef.current && stageRef.current) {
      const node = stageRef.current.findOne('#' + selectedNodeId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedNodeId, tool]);

  const frameDefinition = frameId ? MANGA_FRAMES.find(f => f.id === frameId) : null;

  useEffect(() => {
    const padding = 40;
    const scaleX = (window.innerWidth - padding) / canvasWidth;
    const scaleY = (window.innerHeight - 150) / canvasHeight; 
    const startScale = Math.min(scaleX, scaleY);
    setScale(startScale);
    setPosition({ x: 0, y: 0 });

    // HiDPI / Retina Display Support
    Konva.pixelRatio = window.devicePixelRatio || 1;

    const handleResize = () => setStageSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
     if (initialImage && lines.length === 0 && historyStep === 0) {
        setLines([{
           id: 'initial_image',
           tool: 'brush',
           points: [],
           color: 'transparent',
           size: 1,
           layerId: 'layer_bg', // put under active layer
           opacity: 1,
           smooth: true,
           tension: 0.5,
           thinning: 0,
           lineCap: 'round',
           lineJoin: 'round',
           type: 'image',
           imageType: 'base64',
           imageDataObject: initialImage,
           x: 0,
           y: 0,
           rotation: 0,
           globalCompositeOperation: 'source-over',
           width: canvasWidth,
           height: canvasHeight
        } as any]);
     }
  }, [initialImage, canvasWidth, canvasHeight]);

  useEffect(() => {
    // Disable smoothing if scale is > 4 (400%)
    if (stageRef.current) {
        const stage = stageRef.current;
        const layerContexts = stage.getLayers().map((l: any) => l.getContext()._context);
        layerContexts.forEach((ctx: CanvasRenderingContext2D) => {
            if (ctx) {
               ctx.imageSmoothingEnabled = scale <= 4;
            }
        });
    }
  }, [scale]);

  const lastDistRef = useRef<number>(0);
  const lastCenterRef = useRef<{x: number, y: number} | null>(null);

  const handleImageUpload = (file: File | null) => {
    setUploadedImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImagePreview(url);
    } else {
      setUploadedImagePreview(null);
    }
  };

    const generateAIPanelImage = async (directToManga?: boolean) => {
    setAiError("");
    if (!aiPrompt.trim()) {
      setAiError("Please enter a prompt.");
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const width = canvasWidth || 800;
      const height = targetHeight || canvasHeight || 800;
      const fullPrompt = `${aiPrompt}, ${aiStyle}`;
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&nologo=true`;
      
      const res = await fetch(pollinationsUrl);

      if (!res.ok) {
         throw new Error(`Generation failed: ${res.statusText}`);
      }

      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
         const dataUrl = reader.result as string;
         
         if (directToManga && onSaveToManga) {
            onSaveToManga(dataUrl);
            setIsGeneratingAI(false);
            setShowAIModal(false);
         } else {
            const img = new window.Image();
            img.onload = () => {
                const naturalW = img.width;
                const naturalH = img.height;
                const scale = Math.max(canvasWidth / naturalW, (targetHeight ? targetHeight : 800) / naturalH);
                
                setLines(prev => [
                  ...prev,
                  {
                    id: 'ai_' + Date.now().toString(),
                    tool: 'brush', // type requires 'brush' or 'eraser' for DrawingLine
                    points: [],
                    color: 'transparent',
                    size: 1,
                    layerId: activeLayerId,
                    opacity: 1,
                    type: 'image',
                    imageType: 'base64',
                    imageDataObject: dataUrl,
                    x: (canvasWidth - naturalW * scale) / 2,
                    y: ((targetHeight || 800) - naturalH * scale) / 2,
                    rotation: 0,
                    globalCompositeOperation: (brushBlendMode as any) || 'source-over',
                    width: naturalW * scale,
                    height: naturalH * scale
                  } as any
                ]);
                setIsGeneratingAI(false);
                setShowAIModal(false);
            };
            img.src = dataUrl;
         }
      };
      reader.readAsDataURL(blob);
    } catch (e: any) {
      setAiError(e.message || "An error occurred");
      setIsGeneratingAI(false);
    }
  };

   const generate3DModel = async () => {
    setIsGenerating3D(true);
    setErrorMessage("");
    setGlbUrl(""); // Clear previous model
    try {
        if (!uploadedImage) {
            throw new Error("Please upload an image first.");
        }
        
        let fileObject: File = uploadedImage;

        const endpoint = customEndpoint.trim() || (modelSelection === 'trellis' ? "microsoft/TRELLIS" : "tencent/Hunyuan3D-2");
        const options: any = hfToken.trim() ? { hf_token: hfToken.trim() } : {};
        
        setGenerationStatus(`Connecting to generation server...`);
        const client = await Client.connect(endpoint, options);
        
        let finalGlbUrl = "";
        
        setGenerationStatus(`Processing image...`);
        if (modelSelection === 'trellis') {
            await client.predict("/start_session", []);
            const preRes = await client.predict("/preprocess_image", [fileObject]) as any;
            setGenerationStatus(`Generating 3D assets (this takes ~30-60s)...`);
            const img3dRes = await client.predict("/image_to_3d", [preRes.data[0], null, false, 0, 7.5, 12, 3.0, 12, "stochastic"]) as any;
            setGenerationStatus(`Extracting GLB model...`);
            const glbRes = await client.predict("/extract_glb", [img3dRes.data[0], 0.95, 1024]) as any;
            const item = glbRes.data[0];
            const url = item?.value?.url || item?.url || (typeof item === 'string' ? item : "");
            
            if (url && !url.startsWith('http')) {
               const config = (client as any).config;
               if (config && config.root) {
                  finalGlbUrl = `${config.root.endsWith('/') ? config.root : config.root + '/'}file=${item.path || url}`;
               } else {
                  finalGlbUrl = url;
               }
            } else {
                finalGlbUrl = url;
            }
        } else {
            const targetEndpoint = withTextures ? "/generation_all" : "/shape_generation";
            setGenerationStatus(`Starting ${withTextures ? 'full generation' : 'shape generation'}...`);
            const args = [
               "", fileObject, null, null, null, null, 
               withTextures ? 50 : 30, 
               withTextures ? 7.5 : 5, 
               1234, 256, true, 
               withTextures ? 200000 : 8000, 
               true
            ];
            const result = await client.predict(targetEndpoint, args as any) as any;
            const dataItem = withTextures ? result.data[1] : result.data[0];
            const url = dataItem?.value?.url || dataItem?.url || (typeof dataItem === 'string' ? dataItem : "");
            
            if (url && !url.startsWith('http')) {
               const config = (client as any).config;
               if (config && config.root) {
                  finalGlbUrl = `${config.root.endsWith('/') ? config.root : config.root + '/'}file=${dataItem.path || url}`;
               } else {
                  finalGlbUrl = url;
               }
            } else {
                finalGlbUrl = url;
            }
        }
        
        if (!finalGlbUrl) {
           throw new Error("Failed to extract GLB URL from response.");
        }
        
        setGlbUrl(finalGlbUrl);
        setGenerationStatus("Done!");
    } catch (e: any) {
        console.error("Gradio Client Error:", e);
        let errorString = e.message || String(e);
        const lowerError = errorString.toLowerCase();
        
        if (lowerError.includes("zerogpu") || lowerError.includes("quota") || lowerError.includes("limit")) {
             errorString = "The shared server has reached its temporary GPU limit for this model. This is a global limit for all users. \n\nPlease wait 10-15 minutes, try '2D to 3D #2', or provide your own HuggingFace Access Token in the settings below for a prioritized private connection.";
        } else if (lowerError.includes("network error") || lowerError.includes("connection errored out") || lowerError.includes("unexpected error")) {
             errorString = "Connection to the generation server dropped. The server might be asleep, overloaded with traffic, or restarting. Please wait a moment and try again, or provide an Access Token for a prioritized connection.";
        } else if (lowerError.includes("queue full") || lowerError.includes("capacity")) {
             errorString = "The generation server queue is currently full due to high traffic. Please try again in a few minutes.";
        } else if (lowerError.includes("403") || lowerError.includes("unauthorized") || lowerError.includes("invalid token")) {
             errorString = "Access denied. If you provided an Access Token, please ensure it is valid and has the correct permissions.";
        }
        
        setErrorMessage(errorString);
        setGenerationStatus(`Generation Failed`);
    } finally {
        setIsGenerating3D(false);
    }
  };

  const handleTouchMove = (e: any) => {
    e.evt.preventDefault();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2) {
      if (isDrawingRef.current) {
        // Cancel drawing if two fingers are down
        isDrawingRef.current = false;
        setCurrentLine(null);
      }

      const stage = stageRef.current;
      if (!stage) return;

      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };

      const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;

      if (lastCenterRef.current && lastDistRef.current && lastAngleRef.current !== null) {
        const lastDist = lastDistRef.current;
        const lastCenter = lastCenterRef.current;
        const lastAngle = lastAngleRef.current;

        const scaleBy = dist / lastDist;
        const oldScale = stage.scaleX();
        let newScale = oldScale * scaleBy;
        newScale = Math.min(32.0, Math.max(0.1, newScale));
        
        let deltaAngle = angle - lastAngle;
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;

        // Current stage center on screen
        const stageX = stageSize.width / 2 + position.x;
        const stageY = stageSize.height / 2 + position.y;

        const rad = deltaAngle * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Vector from touch center to stage center
        const dx = stageX - lastCenter.x;
        const dy = stageY - lastCenter.y;

        // Scale and rotate the vector
        const dx_scaled = dx * scaleBy;
        const dy_scaled = dy * scaleBy;
        const dx_new = dx_scaled * cos - dy_scaled * sin;
        const dy_new = dx_scaled * sin + dy_scaled * cos;

        // Direct stage update for extreme performance
        stage.scaleX(newScale);
        stage.scaleY(newScale);
        stage.rotation(stage.rotation() + deltaAngle);
        stage.batchDraw();

        // Canvas position is locked - strictly still
      }

      lastDistRef.current = dist;
      lastCenterRef.current = center;
      lastAngleRef.current = angle;
    }
  };

  const handleTouchEnd = () => {
    lastDistRef.current = 0;
    lastCenterRef.current = null;
    lastAngleRef.current = null;
    
    // Sync React state exactly once when touch ends
    if (stageRef.current) {
        setScale(stageRef.current.scaleX());
        setRotation(stageRef.current.rotation());
    }
  };

  const currentLineRef = useRef<Konva.Line | null>(null);
  const currentPointsRef = useRef<number[]>([]);

  const handlePointerDown = (e: any) => {
    // Check if multi-touch
    if (e.evt.touches && e.evt.touches.length > 1) {
       isDrawingRef.current = false;
       setCurrentLine(null);
       return; 
    }

    const stage = stageRef.current;
    if (!stage) return;

    const point = stage.getRelativePointerPosition();
    if (!point) return;

    // Bounds check
    if (point.x < 0 || point.x > canvasWidth || point.y < 0 || point.y > canvasHeight) return;

    if (tool === 'eyedropper') {
       try {
         const pointer = stage.getPointerPosition();
         if (!pointer) return;
         
         const canvas = stage.toCanvas({ pixelRatio: 1 });
         const ctx = canvas.getContext('2d');
         if (ctx) {
            const pixel = ctx.getImageData(pointer.x, pointer.y, 1, 1).data;
            if (pixel[3] > 0) { 
               const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
               setColor(hex);
               setActivePanel('colors');
            }
         }
       } catch (err) {
         console.error("Eyedropper failed:", err);
       }
       return;
    }
    if (tool === 'text') {
    const textStage = e.target.getStage();
    const pos = textStage.getRelativePointerPosition();
    const textVal = prompt("Enter text:", "Text");
    if (textVal) {
      setTexts(prev => [...prev, {
        id: 'text_' + Date.now(),
        x: pos.x,
        y: pos.y,
        text: textVal,
        fontSize: 32,
        fill: color,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        layerId: activeLayerId,
      }]);
    }
    return;
  }
    if (tool === 'move') return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer || activeLayer.locked || !activeLayer.visible) return;

    isDrawingRef.current = true;
    setIsDrawingUI(true);
    
    currentPointsRef.current = [point.x, point.y];
    const newLine: DrawingLine = {
      id: 'line_' + Date.now(),
      tool: tool as 'brush' | 'eraser',
      points: [point.x, point.y],
      color: tool === 'eraser' ? 'rgba(0,0,0,1)' : color,
      size: brushSize,
      opacity: brushOpacity,
      tension: brushTension,
      thinning: brushThinning,
      smooth: stabilizerEnabled, 
      lineCap: 'round',
      lineJoin: 'round',
      layerId: activeLayerId,
      globalCompositeOperation: tool === 'eraser' ? 'destination-out' : (brushBlendMode as any),
    };

    setCurrentLine(newLine);
  };

  const handlePointerMove = (e: any) => {
    if (!isDrawingRef.current || !currentLine) return;
    
    // Check multi-touch
    if (e.evt.touches && e.evt.touches.length > 1) {
       isDrawingRef.current = false;
       setCurrentLine(null);
       return;
    }

    if (tool === 'move' || tool === 'eyedropper' || tool === 'text') return;

    const stage = stageRef.current;
    if (!stage) return;
    const point = stage.getRelativePointerPosition();
    if (!point) return;

    // Bounds check - clamp to canvas
    point.x = Math.max(0, Math.min(canvasWidth, point.x));
    point.y = Math.max(0, Math.min(canvasHeight, point.y));

    const lastX = currentPointsRef.current[currentPointsRef.current.length - 2];
    const lastY = currentPointsRef.current[currentPointsRef.current.length - 1];
    const dist = Math.sqrt(Math.pow(point.x - lastX, 2) + Math.pow(point.y - lastY, 2));
    
    // Stabilizer check
    const minStep = stabilizerEnabled ? 4 : 1.5;
    if (dist < minStep) return;

    currentPointsRef.current.push(point.x, point.y);
    
    // Direct Konva manipulation for 0-lag rendering
    if (currentLineRef.current) {
        currentLineRef.current.setAttrs({
            points: [...currentPointsRef.current]
        });
        currentLineRef.current.getLayer()?.batchDraw();
    }
  };

  const handlePointerUp = () => {
    if (tool === 'move' || tool === 'eyedropper' || tool === 'text') return;
    
    // If drawing was cancelled by multi-touch or other reasons
    if (!isDrawingRef.current) return;
    
    isDrawingRef.current = false;
    setIsDrawingUI(false);
    
    if (currentLine) {
      const newLine = { ...currentLine, points: [...currentPointsRef.current] };
      const newLines = [...lines, newLine];
      setLines(newLines);
      setCurrentLine(null);
      currentPointsRef.current = [];
      
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newLines);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyStep === 0) {
      setLines([]);
      setHistoryStep(-1);
      return;
    }
    if (historyStep > 0) {
      const p = historyStep - 1;
      setLines(history[p]);
      setHistoryStep(p);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const n = historyStep + 1;
      setLines(history[n]);
      setHistoryStep(n);
    }
  };
  
  const wheelTimeout = useRef<any>(null);
  
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    
    const scaleBy = 1.05; // smoother zoom
    const oldScale = stage.scaleX();
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.min(32.0, Math.max(0.1, newScale));

    // Direct stage update for extreme performance
    stage.scaleX(newScale);
    stage.scaleY(newScale);
    stage.batchDraw();

    if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    wheelTimeout.current = setTimeout(() => {
        setScale(stage.scaleX());
    }, 100);
    // Note: position is NOT changed to keep it "strictly still"
  };

  const exportCanvas = () => {
     if(stageRef.current) {
        const stage = stageRef.current;
        const maskLayer = stage.findOne('#mask-layer');
        if (maskLayer) maskLayer.hide();
        
        const dataURL = stage.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = 'clipper_drawing.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (maskLayer) maskLayer.show();
     }
  }

  const exportToManga = () => {
    if (stageRef.current && onSaveToManga) {
       const stage = stageRef.current;
       const bgRect = stage.findOne('#background-rect');
       const maskLayer = stage.findOne('#mask-layer');
       let origShadowColor = '';
       let origStroke = 0;
       
       if (bgRect) {
           origShadowColor = bgRect.shadowColor();
           origStroke = bgRect.strokeWidth();
           bgRect.shadowColor('transparent');
           bgRect.strokeWidth(0);
       }
       if (maskLayer) maskLayer.hide();
       
       const oldScale = stage.scaleX();
       const oldX = stage.x();
       const oldY = stage.y();
       const oldRotation = stage.rotation();
       const oldOffsetX = stage.offsetX();
       const oldOffsetY = stage.offsetY();
       
       stage.scaleX(1);
       stage.scaleY(1);
       stage.x(0);
       stage.y(0);
       stage.rotation(0);
       stage.offsetX(0);
       stage.offsetY(0);
       
       const dataURL = stage.toDataURL({ pixelRatio: 2, x: 0, y: 0, width: canvasWidth, height: canvasHeight });
       
       stage.scaleX(oldScale);
       stage.scaleY(oldScale);
       stage.x(oldX);
       stage.y(oldY);
       stage.rotation(oldRotation);
       stage.offsetX(oldOffsetX);
       stage.offsetY(oldOffsetY);
       
       if (bgRect) {
           bgRect.shadowColor(origShadowColor);
           bgRect.strokeWidth(origStroke);
       }
       if (maskLayer) maskLayer.show();
       
       if (onSaveToManga) {
          onSaveToManga(dataURL);
       } else {
          localStorage.setItem('clipper_applied_image', dataURL);
          const urlParams = new URLSearchParams(window.location.search);
          const docId = urlParams.get('docId') || window.location.pathname.split('/')[2];
          if (docId) window.location.href = `/doc/${docId}`;
       }
    }
  };

  const moveLayer = (direction: 'up' | 'down') => {
     const index = layers.findIndex(l => l.id === activeLayerId);
     if (index < 0) return;
     const newLayers = [...layers];
     const targetIndex = direction === 'up' ? index - 1 : index + 1;
     
     if (newLayers[index].locked) return;
     if (targetIndex < 0 || targetIndex >= newLayers.length || newLayers[targetIndex].locked) return;
     
     const temp = newLayers[index];
     newLayers[index] = newLayers[targetIndex];
     newLayers[targetIndex] = temp;
     setLayers(newLayers);
  };

  const clearLayer = () => {
     setLines(lines.filter(l => l.layerId !== activeLayerId));
  };
  
  const handleUpdateLine = useCallback((updatedLine: DrawingLine) => {
     setLines(prev => prev.map(l => l.id === updatedLine.id ? updatedLine : l));
  }, []);

  const stageX = stageSize.width / 2 + position.x;
  const stageY = stageSize.height / 2 + position.y;

  const parsedPoints = React.useMemo(() => {
    if (!clipPath || !clipPath.includes('polygon(')) return null;
    const match = clipPath.match(/polygon\((.*?)\)/);
    if (!match) return null;
    const pointsStr = match[1].split(',');
    const points: number[] = [];
    pointsStr.forEach(p => {
      const coords = p.trim().split(/\s+/);
      if (coords.length === 2) {
        const getVal = (valStr: string, max: number) => {
          if (valStr.endsWith('%')) return (parseFloat(valStr) / 100) * max;
          return parseFloat(valStr);
        }
        points.push(getVal(coords[0], canvasWidth));
        points.push(getVal(coords[1], canvasHeight));
      }
    });
    return points;
  }, [clipPath, canvasWidth, canvasHeight]);

  const clipFn = React.useCallback((ctx: any) => {
    ctx.beginPath();
    
    if (parsedPoints && parsedPoints.length >= 6) {
      ctx.moveTo(parsedPoints[0], parsedPoints[1]);
      for (let i = 2; i < parsedPoints.length; i += 2) {
        ctx.lineTo(parsedPoints[i], parsedPoints[i + 1]);
      }
    } else {
      ctx.rect(0, 0, canvasWidth, canvasHeight);
    }
    ctx.closePath();
  }, [parsedPoints, canvasWidth, canvasHeight]);

  const linesByLayer = React.useMemo(() => {
    const map: Record<string, DrawingLine[]> = {};
    layers.forEach(l => { map[l.id] = []; });
    lines.forEach(line => {
      if (map[line.layerId]) {
        map[line.layerId].push(line);
      }
    });
    return map;
  }, [lines, layers]);

  const textsByLayer = React.useMemo(() => {
    const map: Record<string, any[]> = {};
    layers.forEach(l => { map[l.id] = []; });
    texts.forEach(text => {
      if (map[text.layerId]) {
        map[text.layerId].push(text);
      }
    });
    return map;
  }, [texts, layers]);

  const sortedLayers = React.useMemo(() => {
    return [...layers].reverse().filter(l => l.id !== 'layer_bg');
  }, [layers]);

  return (
    <div className="fixed inset-0 z-50 bg-[#2b2b2b] overflow-hidden font-sans select-none text-gray-900">
      
      {/* Background Grid Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px', backgroundPosition: `${stageX}px ${stageY}px` }}></div>

      {/* Main Full Size Canvas */}
      <div className="absolute inset-0 cursor-crosshair" style={{ touchAction: 'none' }}>
         <Stage 
            width={stageSize.width}
            height={stageSize.height}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            draggable={tool === 'move'}
            onDragEnd={(e) => {
              if (e.target === e.target.getStage()) {
                  setPosition({
                    x: e.target.x() - stageSize.width / 2,
                    y: e.target.y() - stageSize.height / 2
                  });
              }
            }}
            ref={stageRef}
            scaleX={scale}
            scaleY={scale}
            x={stageX}
            y={stageY}
            offset={{ x: canvasWidth / 2, y: canvasHeight / 2 }}
            rotation={rotation}
         >
           <Layer>
              <Rect id="background-rect" x={0} y={0} width={canvasWidth} height={canvasHeight} fill="white" stroke="#d0d0d0" strokeWidth={1} shadowColor="rgba(0,0,0,0.4)" shadowBlur={30} shadowOffsetX={0} shadowOffsetY={15} />
           </Layer>
           
           {/* All user-defined layers except background */}
           {sortedLayers.map((layer, index, reversedArr) => {
                let clipBaseLayer = null;
                if (layer.clipping) {
                  for (let i = index + 1; i < reversedArr.length; i++) {
                    if (!reversedArr[i].clipping) {
                       clipBaseLayer = reversedArr[i];
                       break;
                    }
                  }
                }
                return layer.visible && (
                  <Layer 
                    key={layer.id} 
                    id={layer.id}
                    name={layer.id}
                    ref={(node) => {
                      if (node && node.getCanvas()) {
                        const canvasEl = node.getCanvas()._canvas;
                        if (canvasEl) {
                          let mode = layer.blendMode as string;
                          if (mode === 'source-over') mode = 'normal';
                          if (!['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'].includes(mode)) {
                            mode = 'normal';
                          }
                          canvasEl.style.mixBlendMode = mode;
                          canvasEl.style.opacity = layer.opacity.toString();
                        }
                      }
                    }}
                  >
                    <Group clipFunc={clipFn}>
                      {(linesByLayer[layer.id] || []).map(line => (
                         <MemoizedPath 
                           key={line.id} 
                           line={line} 
                           tool={tool} 
                           onSelect={() => setSelectedNodeId(line.id as string)} 
                           onUpdate={handleUpdateLine} 
                         />
                      ))}
                      {currentLine && currentLine.layerId === layer.id && (
                         <MemoizedPath 
                           key={currentLine.id} 
                           line={currentLine} 
                           tool={tool} 
                           onSelect={() => setSelectedNodeId(currentLine.id as string)}
                           onUpdate={handleUpdateLine}
                           ref={currentLineRef}
                         />
                      )}
                      
                      {(textsByLayer?.[layer.id] || texts.filter(t => t.layerId === layer.id)).map(text => (
                        <Text
                           key={text.id}
                           id={text.id}
                           x={text.x}
                           y={text.y}
                           text={text.text}
                           fontSize={text.fontSize}
                           fill={text.fill}
                           rotation={text.rotation}
                           scaleX={text.scaleX}
                           scaleY={text.scaleY}
                           draggable={false}
                           onDragEnd={(e) => {
                              const newTexts = texts.map(t => t.id === text.id ? { ...t, x: e.target.x(), y: e.target.y() } : t);
                              setTexts(newTexts);
                           }}
                           onTransformEnd={(e) => {
                              const node = e.target;
                              const newTexts = texts.map(t => t.id === text.id ? {
                                 ...t,
                                 x: node.x(),
                                 y: node.y(),
                                 rotation: node.rotation(),
                                 scaleX: node.scaleX(),
                                 scaleY: node.scaleY()
                              } : t);
                              setTexts(newTexts);
                           }}
                        />
                      ))}
                    </Group>
                    {layer.clipping && clipBaseLayer && (
                      <Group globalCompositeOperation="destination-in">
                        {(linesByLayer[clipBaseLayer.id] || []).map(line => (
                          <MemoizedPath 
                            key={`clip_${line.id}`} 
                            line={{...line, color: 'black', opacity: 1, globalCompositeOperation: 'source-over'}} 
                            tool={tool} 
                            onSelect={() => setSelectedNodeId(line.id as string)}
                            onUpdate={handleUpdateLine}
                          />
                        ))}
                        {currentLine && currentLine.layerId === clipBaseLayer.id && (
                          <MemoizedPath 
                            key={`clip_${currentLine.id}`} 
                            line={{...currentLine, color: 'black', opacity: 1, globalCompositeOperation: 'source-over'}} 
                            tool={tool} 
                            onSelect={() => setSelectedNodeId(currentLine.id as string)}
                            onUpdate={handleUpdateLine}
                          />
                        )}
                        {texts.filter(t => t.layerId === clipBaseLayer.id).map(text => (
                          <Text
                             key={`clip_${text.id}`}
                             x={text.x}
                             y={text.y}
                             text={text.text}
                             fontSize={text.fontSize}
                             fill="black"
                             rotation={text.rotation}
                             scaleX={text.scaleX}
                             scaleY={text.scaleY}
                          />
                        ))}
                      </Group>
                    )}
                  </Layer>
                );
              })}
              <Layer>
              </Layer>
              <Layer id="selection-layer" listening={false}>
              </Layer>
              <Layer id="mask-layer" listening={false}>
                 {parsedPoints && (
                    <Shape
                       sceneFunc={(context, shape) => {
                         context.beginPath();
                         context.rect(0, 0, canvasWidth, canvasHeight);
                         context.closePath();
                         context.moveTo(parsedPoints[0], parsedPoints[1]);
                         for (let i = 2; i < parsedPoints.length; i += 2) {
                           context.lineTo(parsedPoints[i], parsedPoints[i + 1]);
                         }
                         context.lineTo(parsedPoints[0], parsedPoints[1]);
                         context.fillStrokeShape(shape);
                       }}
                       fillRule="evenodd"
                       fill="#cccccc"
                    />
                 )}
              </Layer>
         </Stage>
      </div>

      {/* Top Bar Floating */}
      <div className={`absolute top-0 inset-x-0 h-14 bg-transparent flex items-center justify-between px-4 transition-transform z-40 text-gray-500 mt-2 ${isDrawingUI ? '-translate-y-full' : 'translate-y-0'}`}>
         {/* Left Side: Close, Undo & Redo */}
         <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 h-10 rounded-full bg-[#E5E5E5]/90 flex items-center justify-center shadow-sm text-sm font-bold text-gray-700 hover:bg-white transition-colors">
               <ArrowLeft className="w-4 h-4 mr-1"/> Back
            </button>
            <button disabled={historyStep <= -1 && lines.length === 0} onClick={handleUndo} className="w-10 h-10 rounded-full bg-[#E5E5E5]/90 flex items-center justify-center shadow-sm disabled:opacity-50">
               <Undo2 className="w-5 h-5"/>
            </button>
            <button disabled={historyStep >= history.length - 1} onClick={handleRedo} className="w-10 h-10 rounded-full bg-[#E5E5E5]/90 flex items-center justify-center shadow-sm disabled:opacity-50">
               <Redo2 className="w-5 h-5"/>
            </button>
            <button 
                onClick={() => setStabilizerEnabled(!stabilizerEnabled)} 
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${stabilizerEnabled ? 'bg-blue-500 text-white' : 'bg-[#E5E5E5]/90 text-gray-700'}`}
                title="Stabilizer"
            >
               <Hand className="w-5 h-5"/>
            </button>
         </div>
         {/* Right Side: Ruler, Hand, Selection */}
         <div className="flex items-center gap-2">

            <button onClick={exportCanvas} className="w-10 h-10 rounded-full bg-[#E5E5E5]/90 flex items-center justify-center shadow-sm">
               <Download className="w-5 h-5"/>
            </button>
            <button 
                onClick={() => {
                   if(stageRef.current) {
                      const stage = stageRef.current;
                      const maskLayer = stage.findOne('#mask-layer');
                      if (maskLayer) maskLayer.hide();
                      const bgRect = stage.findOne('#background-rect');
                      let origShadowColor = '';
                      let origStroke = 0;
                      if (bgRect) {
                          origShadowColor = bgRect.shadowColor();
                          origStroke = bgRect.strokeWidth();
                          bgRect.shadowColor('transparent');
                          bgRect.strokeWidth(0);
                      }
                      
                      const oldScale = stage.scaleX();
                      const oldX = stage.x();
                      const oldY = stage.y();
                      const oldRotation = stage.rotation();
                      const oldOffsetX = stage.offsetX();
                      const oldOffsetY = stage.offsetY();
                      
                      stage.scaleX(1);
                      stage.scaleY(1);
                      stage.x(0);
                      stage.y(0);
                      stage.rotation(0);
                      stage.offsetX(0);
                      stage.offsetY(0);

                      const dataURL = stage.toDataURL({ pixelRatio: 2, x: 0, y: 0, width: canvasWidth, height: canvasHeight });

                      stage.scaleX(oldScale);
                      stage.scaleY(oldScale);
                      stage.x(oldX);
                      stage.y(oldY);
                      stage.rotation(oldRotation);
                      stage.offsetX(oldOffsetX);
                      stage.offsetY(oldOffsetY);

                      if (bgRect) {
                          bgRect.shadowColor(origShadowColor);
                          bgRect.strokeWidth(origStroke);
                      }
                      if (onSaveToManga) {
                         onSaveToManga(dataURL);
                      } else {
                         localStorage.setItem('clipper_applied_image', dataURL);
                         const urlParams = new URLSearchParams(window.location.search);
                         const docId = urlParams.get('docId') || window.location.pathname.split('/')[2];
                         if (docId) window.location.href = `/doc/${docId}`;
                      }
                      if (maskLayer) maskLayer.show();
                   }
                }}
                className="px-4 py-2 rounded-full bg-blue-500 text-white font-bold shadow-sm hover:bg-blue-600 transition-colors text-sm whitespace-nowrap"
            >
               Apply to Docs
            </button>
            <button onClick={() => setShowAIModal(true)} className="w-10 h-10 px-2 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center shadow-lg text-white font-medium hover:scale-105 active:scale-95 transition-all text-xs" title="AI Generate (Zero-GPU)">
               <Sparkles className="w-5 h-5"/>
            </button>
            <button onClick={() => setShow3DModal(true)} className="w-10 h-10 px-2 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg text-white font-medium hover:scale-105 active:scale-95 transition-all text-xs" title="2D to 3D Generation">
               <Box className="w-5 h-5"/>
            </button>
            <label className="w-10 h-10 rounded-full bg-[#E5E5E5]/90 flex items-center justify-center shadow-sm cursor-pointer hover:bg-[#D5D5D5] transition-colors relative">
               <ImageIcon className="w-5 h-5"/>
               <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                     const reader = new FileReader();
                     reader.onload = (ev) => {
                         const dataUrl = ev.target?.result as string;
                         const img = new window.Image();
                         img.onload = () => {
                             const ratio = Math.max(canvasWidth / img.width, canvasHeight / img.height);
                             const scaledW = img.width * ratio;
                             const scaledH = img.height * ratio;
                             const newImgLine = {
                                id: 'imported_img_' + Date.now(),
                                tool: 'brush', points: [], color: 'transparent', size: 1,
                                layerId: layers.find(l => l.visible)?.id || layers[0].id,
                                opacity: 1, smooth: true, tension: 0.5,
                                thinning: 0, lineCap: 'round', lineJoin: 'round',
                                type: 'image', imageType: 'base64', imageDataObject: dataUrl,
                                x: (canvasWidth - scaledW) / 2, y: (canvasHeight - scaledH) / 2,
                                rotation: 0, globalCompositeOperation: 'source-over',
                                width: scaledW, height: scaledH
                             };
                             const newLines = [...lines, newImgLine as any];
                             setLines(newLines);
                             const newHistory = history.slice(0, historyStep + 1);
                             newHistory.push(newLines);
                             setHistory(newHistory);
                             setHistoryStep(newHistory.length - 1);
                         };
                         img.src = dataUrl;
                     };
                     reader.readAsDataURL(file);
                  }
               }} />
            </label>
         </div>
      </div>

      {/* Floating Tool Grid Popup (Toggled via bottom bar) */}
      <div className={`absolute bottom-20 left-4 w-48 bg-[#333333]/95 backdrop-blur-xl border border-[#444] shadow-2xl rounded-2xl flex flex-col transition-all duration-300 z-40 overflow-hidden text-white
         ${activePanel === 'tools' && !isDrawingUI ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
         <div className="grid grid-cols-2 gap-px bg-[#444] text-xs">
            <button onClick={() => { setTool('brush'); setActivePanel(null); }} className={`bg-[#333] flex flex-col items-center justify-center p-3 gap-1 hover:bg-[#555] ${tool === 'brush' ? 'text-[#00AFFF]' : ''}`}>
               <Brush className="w-5 h-5"/>
               <span>Brush</span>
            </button>
            <button onClick={() => { setTool('eraser'); setActivePanel(null); }} className={`bg-[#333] flex flex-col items-center justify-center p-3 gap-1 hover:bg-[#555] ${tool === 'eraser' ? 'text-[#00AFFF]' : ''}`}>
               <Eraser className="w-5 h-5"/>
               <span>Eraser</span>
            </button>
            <button onClick={() => { setTool('eyedropper'); setActivePanel(null); }} className={`bg-[#333] flex flex-col items-center justify-center p-3 gap-1 hover:bg-[#555] ${tool === 'eyedropper' ? 'text-[#00AFFF]' : ''}`}>
               <Pipette className="w-5 h-5"/>
               <span>Eyedropper</span>
            </button>
            <button onClick={() => { setTool('text'); setActivePanel(null); }} className={`bg-[#333] flex flex-col items-center justify-center p-3 gap-1 hover:bg-[#555] ${tool === 'text' ? 'text-[#00AFFF]' : ''}`}>
               <Type className="w-5 h-5"/>
               <span>Text</span>
            </button>
         </div>
      </div>

      {/* Bottom Panel Wrapper */}
      <div className={`absolute bottom-0 inset-x-0 flex flex-col z-40 transition-transform duration-300 ${isDrawingUI ? 'translate-y-full' : 'translate-y-0'}`}>
         
          {/* Sliders Area */}
         <div className="bg-[#D1D1D1] px-4 py-3 flex flex-col gap-3">
               {/* Size Slider */}
               <div className="flex items-center gap-3">
                  <span className="w-8 text-right text-gray-700 font-medium text-sm">{brushSize.toFixed(1)}</span>
                  <button onClick={() => setBrushSize(b => Math.max(1, b - 1))} className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-lg leading-none pb-0.5">-</button>
                  <input type="range" min="1.0" max="30.0" step="0.1" value={brushSize} onChange={(e) => setBrushSize(parseFloat(e.target.value))} className="flex-1 h-3 bg-gradient-to-r from-gray-400 to-gray-400 rounded-full appearance-none outline-none slider-thumb-large" />
                  <button onClick={() => setBrushSize(b => Math.min(100, b + 1))} className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-lg leading-none pb-0.5">+</button>
               </div>
               
               {/* Opacity Slider */}
               <div className="flex items-center gap-3">
                  <span className="w-8 text-right text-gray-700 font-medium text-sm">{Math.round(brushOpacity * 100)}</span>
                  <button onClick={() => setBrushOpacity(o => Math.max(0, o - 0.05))} className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-lg leading-none pb-0.5">-</button>
                  <input type="range" min="0" max="1" step="0.01" value={brushOpacity} onChange={(e) => setBrushOpacity(parseFloat(e.target.value))} className="flex-1 h-3 bg-gradient-to-r from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.5)] rounded-full appearance-none outline-none slider-thumb-large" />
                  <button onClick={() => setBrushOpacity(o => Math.min(1, o + 0.05))} className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-lg leading-none pb-0.5">+</button>
               </div>
         </div>
         
         {/* Toolbar Area */}
         <div className="bg-[#757575] border-t border-[#666] h-14 flex items-center justify-between px-2 text-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
            
            {/* 1. Toggle Tool */}
            <button onClick={() => setTool(tool === 'eraser' ? 'brush' : 'eraser')} className="flex-1 py-1 flex items-center justify-center hover:bg-white/10 rounded-lg">
               <div className="relative w-8 h-8 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tool === 'eraser' ? 'eraser' : 'brush'}
                      initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
                      transition={{ duration: 0.2 }}
                    >
                      {tool === 'eraser' ? <Eraser className="w-6 h-6" /> : <Brush className="w-6 h-6" />}
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute -bottom-1 -right-1 text-white bg-[#757575] rounded-full p-0.5">
                     <RefreshCw className="w-3 h-3" />
                  </div>
               </div>
            </button>

            {/* 2. Current Tool Icon */}
            <button onClick={() => setActivePanel(activePanel === 'tools' ? null : 'tools')} className="flex-1 py-1 flex items-center justify-center hover:bg-white/10 rounded-lg">
               {tool === 'eraser' ? <Eraser className="w-6 h-6"/> :
                tool === 'text' ? <Type className="w-6 h-6"/> :
                tool === 'eyedropper' ? <Pipette className="w-6 h-6"/> :
                <Brush className="w-6 h-6"/>}
            </button>

             {/* 3. Brush Size Preview */}
             <button onClick={() => setActivePanel(activePanel === 'brush' ? null : 'brush')} className="flex-1 py-1 flex items-center justify-center hover:bg-white/10 rounded-lg">
                <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center bg-black/40 text-[10px] font-bold">
                   {brushSize.toFixed(1)}
                </div>
             </button>
 
             {/* 4. Color Box */}
             <button onClick={() => setActivePanel(activePanel === 'colors' ? null : 'colors')} className="flex-1 py-1 flex justify-center items-center hover:bg-white/10 rounded-lg">
                <div className="w-8 h-8 rounded bg-black border border-white/30 p-0.5">
                   <div className="w-full h-full rounded-sm" style={{ backgroundColor: color }}></div>
                </div>
             </button>
 
             {/* 5. Down Arrow (Smooth UI toggle) */}
             <button onClick={() => setIsDrawingUI(true)} className="flex-1 py-1 flex items-center justify-center hover:bg-white/10 rounded-lg">
                <ArrowDown className="w-6 h-6"/>
             </button>

             {/* 7. Back Arrow */}
             <button onClick={onClose} className="flex-1 py-1 flex items-center justify-center hover:bg-white/10 rounded-lg">
                <ArrowRight className="w-6 h-6 rotate-180 translate-x-1"/>
             </button>
          </div>
       </div>


      {/* --- PANELS --- */}
      

      
      {/* Color Panel */}
      {activePanel === 'colors' && !isDrawingUI && (
         <div className="absolute bottom-16 right-4 md:right-80 w-[300px] bg-[#333333]/95 backdrop-blur-xl border border-[#444] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 z-50 text-white">
            <div className="p-3 border-b border-[#444] flex justify-between items-center bg-black/30">
               <strong className="text-base font-bold ml-1">Color</strong>
               <div className="flex gap-1 items-center">
                  <div className="w-10 h-6 rounded bg-black"></div>
                  <div className="w-10 h-6 rounded shadow-inner" style={{backgroundColor: color}}></div>
               </div>
            </div>
            
            <div className="p-4 flex flex-col items-center">
               
               <div className="mb-6 flex justify-center">
                  <InteractiveColorWheel color={color} onChange={setColor} />
               </div>
               
               <div className="w-full font-mono text-sm uppercase tracking-widest text-left mb-2 text-gray-300 flex items-center">
                  #<span className="ml-1 text-white">{color.substring(1).toUpperCase()}</span>
               </div>
               
               <div className="w-full space-y-2 mt-2">
                  {(() => {
                     const rgb = hexToRgb(color);
                     const updateColor = (component: 'r' | 'g' | 'b', value: number) => {
                        const newRgb = { ...rgb, [component]: value };
                        setColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                     };
                     return (
                        <>
                           <div className="flex items-center gap-3">
                              <span className="w-8 text-xs font-bold text-left">{rgb.r}</span>
                              <button onClick={() => updateColor('r', Math.max(0, rgb.r - 1))} className="w-6 h-6 rounded-full bg-[#444] text-white flex items-center justify-center pb-0.5">-</button>
                              <input type="range" min="0" max="255" value={rgb.r} onChange={(e) => updateColor('r', parseInt(e.target.value))} className="flex-1 accent-white h-2 rounded-full appearance-none bg-gradient-to-r from-[#333] to-red-500 cursor-pointer" />
                              <button onClick={() => updateColor('r', Math.min(255, rgb.r + 1))} className="w-6 h-6 rounded-full bg-[#444] text-white flex items-center justify-center pb-0.5">+</button>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="w-8 text-xs font-bold text-left">{rgb.g}</span>
                              <button onClick={() => updateColor('g', Math.max(0, rgb.g - 1))} className="w-6 h-6 rounded-full bg-[#444] text-white flex items-center justify-center pb-0.5">-</button>
                              <input type="range" min="0" max="255" value={rgb.g} onChange={(e) => updateColor('g', parseInt(e.target.value))} className="flex-1 accent-white h-2 rounded-full appearance-none bg-gradient-to-r from-[#333] to-green-500 cursor-pointer" />
                              <button onClick={() => updateColor('g', Math.min(255, rgb.g + 1))} className="w-6 h-6 rounded-full bg-[#444] text-white flex items-center justify-center pb-0.5">+</button>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="w-8 text-xs font-bold text-left">{rgb.b}</span>
                              <button onClick={() => updateColor('b', Math.max(0, rgb.b - 1))} className="w-6 h-6 rounded-full bg-[#444] text-white flex items-center justify-center pb-0.5">-</button>
                              <input type="range" min="0" max="255" value={rgb.b} onChange={(e) => updateColor('b', parseInt(e.target.value))} className="flex-1 accent-white h-2 rounded-full appearance-none bg-gradient-to-r from-[#333] to-blue-500 cursor-pointer" />
                              <button onClick={() => updateColor('b', Math.min(255, rgb.b + 1))} className="w-6 h-6 rounded-full bg-[#444] text-white flex items-center justify-center pb-0.5">+</button>
                           </div>
                        </>
                     );
                  })()}
                  <div className="flex items-center gap-3 pt-3">
                     <span className="w-8 text-xs font-bold text-left">100%</span>
                     <button className="w-6 h-6 rounded-full bg-[#444] text-white flex items-center justify-center pb-0.5">-</button>
                     <input type="range" min="0" max="100" value={100} onChange={() => {}} className="flex-1 accent-white h-2 rounded-full appearance-none bg-gradient-to-r from-transparent to-white cursor-pointer" />
                     <button className="w-6 h-6 rounded-full bg-[#444] text-white flex items-center justify-center pb-0.5">+</button>
                  </div>
               </div>
            </div>
            
            <div className="flex border-t border-[#222] bg-black/60 p-1 text-[10px] font-bold text-gray-500 rounded-b-[24px]">
               <button className="flex-1 flex text-white flex-col items-center py-2 transition-colors">
                  <div className="w-5 h-5 grid grid-cols-3 grid-rows-3 gap-0.5 mb-1"><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div></div>
                  Palette
               </button>
               <button className="flex-1 flex flex-col items-center py-2 text-[#00AFFF] transition-colors">
                  <div className="w-5 h-5 mb-1 relative"><CircleIcon className="w-3 h-3 absolute top-0 left-1/2 -translate-x-1/2 border-2 border-current rounded-full"/><CircleIcon className="w-3 h-3 absolute bottom-0 left-0 border-2 border-current rounded-full"/><CircleIcon className="w-3 h-3 absolute bottom-0 right-0 border-2 border-current rounded-full"/></div>
                  RGB
               </button>
               <button className="flex-1 flex flex-col items-center py-2 hover:text-white transition-colors">
                  <CircleIcon className="w-5 h-5 mb-1 border-[2.5px] border-current rounded-full border-dashed" />
                  HSB
               </button>
            </div>
         </div>
      )}

      {/* Brush Library Panel */}
      {activePanel === 'brush' && !isDrawingUI && (
         <div className="absolute top-16 left-4 md:left-[80px] w-[340px] bg-[#333333]/95 backdrop-blur-xl border border-[#444] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left-4 z-50 flex flex-col max-h-[80vh] text-white">
            <div className="px-4 py-3 font-semibold text-base border-b border-[#444] flex justify-between items-center bg-black/30">
               <div>
                  Brush ({BRUSHES.length})
               </div>
               <div className="flex gap-4">
                  <button className="text-white hover:text-gray-300">
                     <span className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center leading-none pb-1">...</span>
                  </button>
               </div>
            </div>
            
            <div className="px-4 py-2 border-b border-[#444] flex items-center gap-2 bg-[#222]">
               <button className="bg-black text-white px-2 py-1 rounded border border-[#555]"><ArrowLeft className="w-5 h-5"/></button>
               <div className="flex-1 text-center bg-transparent relative border-x border-[#444] h-12 flex flex-col justify-center overflow-hidden">
                  <svg className="w-full h-8 px-2" viewBox="0 0 100 20" preserveAspectRatio="none">
                     <path d="M0,10 Q25,0 50,10 T100,10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="absolute bottom-0 w-full text-center text-xs font-semibold">{selectedBrush}</span>
               </div>
            </div>

            <div className="flex text-xs font-medium border-b border-[#555]">
               <button className="flex-1 py-2.5 bg-white text-black text-center">Basic</button>
               <button className="flex-1 py-2.5 bg-[#444] text-white border-x border-[#555] text-center shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)] hover:bg-[#555]">Custom</button>
               <button className="flex-1 py-2.5 bg-[#444] text-white text-center shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)] hover:bg-[#555]">Online</button>
               <button className="px-3 bg-[#444] text-white border-l border-[#555] flex items-center cursor-not-allowed">🔍</button>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
               {BRUSHES.map((b) => (
                  <div 
                     key={b} 
                     onClick={() => setSelectedBrush(b)}
                     className={`flex items-center px-3 py-1 cursor-pointer transition-colors border-b border-[#444] ${selectedBrush === b ? 'border-2 border-[#00AFFF] bg-[#222]' : 'hover:bg-[#444]'}`}
                  >
                     <button className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center shrink-0 hover:border-white transition-colors">
                        <Plus className="w-4 h-4 text-gray-300"/>
                     </button>
                     <div className="flex-1 px-3 py-1 flex flex-col justify-center">
                        <svg className="w-full h-6" viewBox="0 0 100 20" preserveAspectRatio="none">
                           <path d="M0,10 Q25,-5 50,10 T100,10" fill="none" stroke="white" strokeWidth={b.includes('Soft') ? 4 : (b.includes('Hard') ? 1.5 : 2.5)} strokeLinecap="round" opacity={b.includes('Fade') ? '0.5' : '1'} style={{ filter: b.includes('Bleed') ? 'blur(1px)' : 'none' }}/>
                        </svg>
                        <span className="text-xs">{b}</span>
                     </div>
                     <span className="text-xs text-right w-8">{b.includes('Soft') ? '60.0' : (b.includes('Hard') ? '1.2' : '30.0')}</span>
                     <button className="ml-2 text-gray-400 hover:text-white font-bold">&gt;</button>
                  </div>
               ))}
            </div>
            
            <div className="bg-[#222] p-2 border-t border-[#444] overflow-y-auto max-h-48 subtle-scrollbar">
               <div className="flex items-center justify-between px-2 text-xs mb-1">
                  <span>Thickness</span>
                  <span>{brushSize}px</span>
               </div>
               <div className="flex items-center gap-2 px-1 mb-2">
                  <button onClick={() => setBrushSize(Math.max(1, brushSize - 1))} className="w-6 h-6 rounded-full bg-[#444] text-white pb-0.5 flex items-center justify-center">-</button>
                  <input type="range" min="1" max="200" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="flex-1 h-2 bg-[#555] rounded-lg appearance-none cursor-pointer accent-white" />
                  <button onClick={() => setBrushSize(Math.min(200, brushSize + 1))} className="w-6 h-6 rounded-full bg-[#444] text-white pb-0.5 flex items-center justify-center">+</button>
               </div>
               
               <div className="flex items-center justify-between px-2 text-xs mb-1 mt-2">
                  <span>Thinning</span>
                  <span>{Math.round(brushThinning * 100)}%</span>
               </div>
               <div className="flex items-center gap-2 px-1 mb-2">
                  <input type="range" min="-1" max="1" step="0.01" value={brushThinning} onChange={(e) => setBrushThinning(parseFloat(e.target.value))} className="flex-1 h-2 bg-[#555] rounded-lg appearance-none cursor-pointer accent-white" />
               </div>

               <div className="flex items-center justify-between px-2 text-xs mb-1">
                  <span>Opacity</span>
                  <span>{Math.round(brushOpacity * 100)}%</span>
               </div>
               <div className="flex items-center gap-2 px-1 mb-1">
                  <button onClick={() => setBrushOpacity(Math.max(0.01, brushOpacity - 0.01))} className="w-6 h-6 rounded-full bg-[#444] text-white pb-0.5 flex items-center justify-center">-</button>
                  <input type="range" min="0.01" max="1" step="0.01" value={brushOpacity} onChange={(e) => setBrushOpacity(parseFloat(e.target.value))} className="flex-1 h-2 bg-[#555] rounded-lg appearance-none cursor-pointer accent-white" />
                  <button onClick={() => setBrushOpacity(Math.min(1, brushOpacity + 0.01))} className="w-6 h-6 rounded-full bg-[#444] text-white pb-0.5 flex items-center justify-center">+</button>
               </div>
               
               <div className="flex items-center justify-between px-2 text-xs mb-1 mt-2">
                  <span>Force Fade In</span>
                  <span>{brushFadeStart}%</span>
               </div>
               <div className="flex items-center gap-2 px-1 mb-1">
                  <input type="range" min="0" max="100" value={brushFadeStart} onChange={(e) => setBrushFadeStart(parseInt(e.target.value))} className="flex-1 h-2 bg-[#555] rounded-lg appearance-none cursor-pointer accent-white" />
               </div>
               
               <div className="flex items-center justify-between px-2 text-xs mb-1 mt-2">
                  <span>Force Fade Out</span>
                  <span>{brushFadeEnd}%</span>
               </div>
               <div className="flex items-center gap-2 px-1 mb-1">
                  <input type="range" min="0" max="100" value={brushFadeEnd} onChange={(e) => setBrushFadeEnd(parseInt(e.target.value))} className="flex-1 h-2 bg-[#555] rounded-lg appearance-none cursor-pointer accent-white" />
               </div>
            </div>
         </div>
      )}

      {/* Brush Blend Modes Panel */}
      {activePanel === 'brush_blend' && !isDrawingUI && (
         <div className="absolute top-[160px] left-[320px] w-48 bg-[#222]/95 backdrop-blur-xl border border-[#444] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60] max-h-[300px] text-white">
            <div className="flex text-sm font-semibold border-b border-[#444] bg-[#111]">
               <button className="flex-1 py-1.5 text-white text-center">Blending Mode</button>
            </div>
            <div className="flex-1 overflow-y-auto subtle-scrollbar">
               <div className="flex flex-col">
               {BLEND_MODES.map((mode) => (
                  <button 
                     key={mode} 
                     onClick={() => { setBrushBlendMode(mode as any); setActivePanel('brush'); }}
                     className={`w-full text-left px-3 py-1.5 text-xs transition-colors border-b border-[#333] last:border-0 ${brushBlendMode === mode ? 'bg-[#00AFFF] text-white font-bold' : 'hover:bg-[#444] text-gray-300'}`}
                  >
                     {mode.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
               ))}
               </div>
            </div>
         </div>
      )}

      {/* Layer Blend Modes Panel */}


      {show3DViewerInCanvas && glbUrl && (
         <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center">
            <div className="relative w-[85vw] h-[85vh] max-w-[800px] max-h-[800px] pointer-events-auto bg-[#1a1a1a] rounded-2xl overflow-hidden border-4 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md group">
               <div className="absolute top-0 inset-x-0 h-10 bg-black/40 flex items-center justify-between px-4 z-20">
                  <span className="text-white/70 text-xs font-bold tracking-widest uppercase">3D Preview Mode</span>
                  <button onClick={() => setShow3DViewerInCanvas(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                     <X className="w-5 h-5 text-white" />
                  </button>
               </div>
               {React.createElement('model-viewer', {
                  src: glbUrl,
                  "camera-controls": "true",
                  "auto-rotate": "true",
                  "shadow-intensity": "2",
                  "environment-image": "neutral",
                  "exposure": "1.2",
                  "interaction-prompt": "auto",
                  className: "w-full h-full",
                  style: { width: '100%', height: '100%', display: 'block', backgroundColor: 'transparent' }
               })}
            </div>
         </div>
      )}

      {showAIModal && (
         <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm px-4">
            <div className="bg-[#FAF9F6] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh]">
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
                  <div className="flex items-center gap-2">
                     <Sparkles className="w-5 h-5 text-pink-500" />
                     <h2 className="text-lg font-bold text-gray-800">Generate AI Manga</h2>
                  </div>
                  <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                     <X className="w-5 h-5 text-gray-500" />
                  </button>
               </div>

               <div className="p-6 flex flex-col gap-4 overflow-y-auto">
                  
                  <div className="flex flex-col gap-2">
                     <label className="text-sm font-semibold text-gray-700">Art Style</label>
                     <select value={aiStyle} onChange={e => setAiStyle(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white outline-none focus:border-pink-400">
                        <option value="manga lineart, black and white manga page style, ink drawing, highly detailed, masterwork">Manga Lineart (B&W)</option>
                        <option value="manhwa webtoon style, full color, highly detailed, cel shaded, masterwork">Manhwa Webtoon (Colored)</option>
                        <option value="anime screenshot style, full color, 90s aesthetic, studio ghibli vibe, masterwork">90s Anime Screenshot</option>
                        <option value="hyper realistic, cinematic lighting, 8k resolution, highly detailed realism">Realistic Rendering</option>
                     </select>
                  </div>

                  <div className="flex flex-col gap-2">
                     <label className="text-sm font-semibold text-gray-700">Image Prompt</label>

                     <textarea 
                        value={aiPrompt} 
                        onChange={e => setAiPrompt(e.target.value)} 
                        placeholder="E.g., 1girl, high quality, intense gaze, manga style, speedlines..." 
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-white outline-none focus:border-pink-400 min-h-[100px] resize-none"
                     ></textarea>
                  </div>

                  <div className="bg-pink-50 border border-pink-100 rounded-lg p-3 text-xs text-pink-800">
                     Generated image will be placed directly into your workspace.
                  </div>
                  
                  {aiError && (
                     <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-600">
                        {aiError}
                     </div>
                  )}
                  
                  <div className="flex flex-col gap-2 mt-2">
                     <button onClick={() => generateAIPanelImage(false)} disabled={isGeneratingAI || !aiPrompt.trim()} className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                        {isGeneratingAI ? 'Generating...' : <><Sparkles className="w-4 h-4"/> Generate & Insert into Canvas</>}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {show3DModal && (
         <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm px-4">
            <div className="bg-[#FAF9F6] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-2">
                     <Box className="w-5 h-5 text-indigo-600" />
                     <h2 className="text-xl font-bold text-gray-800">2D to 3D Generation</h2>
                  </div>
                  <button onClick={() => setShow3DModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                     <X className="w-5 h-5 text-gray-500" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                  {/* Model Selection */}
                  <div className="flex flex-col gap-2">
                     <label className="font-semibold text-gray-700">Model Selection</label>
                     <div className="flex gap-2">
                        <button onClick={() => setModelSelection('trellis')} className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-300 ${modelSelection === 'trellis' ? 'border-purple-400 bg-purple-50/50 text-purple-700 font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse' : 'border-gray-200 hover:bg-gray-50 text-gray-600 font-medium'}`}>
                           2D to 3D #1
                        </button>
                        <button onClick={() => setModelSelection('hunyuan')} className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-300 ${modelSelection === 'hunyuan' ? 'border-purple-400 bg-purple-50/50 text-purple-700 font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse' : 'border-gray-200 hover:bg-gray-50 text-gray-600 font-medium'}`}>
                           2D to 3D #2
                        </button>
                     </div>
                  </div>

                  {/* Settings */}
                  <div className="flex flex-col gap-5 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                     <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 shadow-sm flex gap-2 items-start">
                        <span className="text-sm">ℹ️</span>
                        <p className="leading-relaxed">
                           <strong>Daily Limits:</strong> Generations happen securely. You receive a free daily quota (5-10 generations, depending on server load). Wait in queue if servers are busy.
                        </p>
                     </div>

                     <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Source Image</span>
                        <div className="flex items-start gap-4">
                           <div className="relative group overflow-hidden border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 bg-gray-50 transition-colors w-32 h-32 flex-shrink-0 flex flex-col items-center justify-center text-center cursor-pointer">
                              {uploadedImagePreview ? (
                                 <img src={uploadedImagePreview} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Upload preview" />
                              ) : (
                                 <div className="text-gray-400 flex flex-col items-center p-2">
                                    <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                                    <span className="text-xs font-medium">Click to Upload</span>
                                 </div>
                              )}
                              <input 
                                 type="file" 
                                 accept="image/*" 
                                 onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                                 className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                           </div>
                           
                           <div className="flex flex-col gap-2 pt-2">
                              {uploadedImage ? (
                                 <>
                                    <span className="text-sm font-medium text-gray-700 max-w-[200px] truncate">{uploadedImage.name}</span>
                                    <span className="text-xs text-green-600 font-medium">Image ready for 3D conversion.</span>
                                 </>
                              ) : (
                                 <span className="text-sm text-gray-500 mt-2">
                                    Please upload an image to convert to a 3D model.
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>
                     
                     {modelSelection === 'hunyuan' && (
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer pt-2 border-t border-gray-100">
                           <input type="checkbox" checked={withTextures} onChange={(e) => setWithTextures(e.target.checked)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                           Generate with Textures
                        </label>
                     )}

                     <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Access Token (Optional)</span>
                        <input type="password" placeholder="Provide access token to bypass limits..." value={hfToken} onChange={(e) => setHfToken(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                     </div>

                     <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Custom API Endpoint (Optional)</span>
                        <input type="text" placeholder="Custom generation endpoint..." value={customEndpoint} onChange={(e) => setCustomEndpoint(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                     </div>
                  </div>

                  {/* Preview & Generation */}
                  <div className={`bg-[#1a1a1a] rounded-xl flex-1 min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden border-2 ${errorMessage ? 'border-red-500/50' : 'border-white/10 shadow-inner'}`}>
                     {glbUrl && !isGenerating3D ? (
                        React.createElement('model-viewer', {
                           src: glbUrl,
                           "camera-controls": "true",
                           "auto-rotate": "true",
                           "shadow-intensity": "2",
                           "environment-image": "neutral",
                           "exposure": "1.2",
                           "interaction-prompt": "auto",
                           className: "w-full h-full absolute inset-0",
                           style: { width: '100%', height: '100%', display: 'block' }
                        })
                     ) : (
                        <div className="flex flex-col items-center gap-4 p-8 text-center">
                           <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${errorMessage ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400'}`}>
                              <Box className="w-8 h-8" />
                           </div>
                           <div className={`text-sm flex flex-col items-center ${errorMessage ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                              {errorMessage ? (
                                 <div className="flex flex-col items-center gap-3 text-center">
                                    <span className="text-base text-red-600 font-bold">Generation Failed</span>
                                    <span className="text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-200 text-red-800 max-w-sm whitespace-pre-wrap">{errorMessage}</span>
                                    <span className="text-xs text-red-400">Please try again or check your configuration.</span>
                                 </div>
                              ) : "No 3D Model Generated yet. Click Generate below."}
                           </div>
                        </div>
                     )}
                     
                     {isGenerating3D && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 transition-all">
                           <div className="relative w-16 h-16 flex items-center justify-center">
                              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                              <Box className="w-6 h-6 text-indigo-600 animate-pulse" />
                           </div>
                           <span className="text-sm font-semibold tracking-wide text-indigo-900 animate-pulse">{generationStatus}</span>
                           <span className="text-xs text-indigo-500 max-w-[250px] text-center">This process can take a minute. Please don't close this window.</span>
                        </div>
                     )}
                  </div>
               </div>

               <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                  <button 
                     onClick={() => {
                        if (glbUrl) {
                           setShow3DViewerInCanvas(true);
                           setShow3DModal(false);
                        }
                     }} 
                     disabled={!glbUrl || isGenerating3D}
                     className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
                  >
                     Send to Canvas
                  </button>
                  <button 
                     onClick={generate3DModel} 
                     disabled={isGenerating3D}
                     className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-[1.05] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] flex items-center gap-2 relative overflow-hidden group"
                  >
                     <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500"></div>
                     {isGenerating3D ? 'Generating...' : <><Box className="w-4 h-4 relative z-10" /> <span className="relative z-10">Generate 3D Model</span></>}
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  )
}

function TopToolButton({ icon, disabled, onClick }: any) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`p-2.5 rounded-xl transition-all ${
        disabled ? 'opacity-30 cursor-not-allowed text-gray-400' :
        'text-gray-700 hover:bg-gray-100 hover:text-black'
      }`}
    >
      {icon}
    </button>
  )
}

function ToolButton({ icon, active, onClick, tooltip }: any) {
   return (
      <button 
         title={tooltip}
         onClick={onClick}
         className={`p-2.5 rounded-xl transition-all ${
           active ? 'bg-blue-100 text-blue-600 shadow-sm' : 
           'text-gray-500 hover:bg-gray-100 hover:text-black'
         }`}
      >
         {icon}
      </button>
   )
}

function hsvToHex(h: number, s: number, v: number): string {
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToHsv(hex: string) {
    let r = parseInt(hex.substring(1, 3), 16) / 255;
    let g = parseInt(hex.substring(3, 5), 16) / 255;
    let b = parseInt(hex.substring(5, 7), 16) / 255;
    if (isNaN(r)) r = 0; if (isNaN(g)) g = 0; if (isNaN(b)) b = 0;
    
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, v };
}

function InteractiveColorWheel({ color, onChange }: { color: string, onChange: (c: string) => void }) {
    const wheelRef = useRef<HTMLDivElement>(null);
    const squareRef = useRef<HTMLDivElement>(null);
    
    const [{ h, s, v }, setHsv] = useState(() => hexToHsv(color));

    useEffect(() => {
        const newHsv = hexToHsv(color);
        if (Math.abs(newHsv.h - h) > 0.01 || Math.abs(newHsv.s - s) > 0.01 || Math.abs(newHsv.v - v) > 0.01) {
            setHsv(newHsv);
        }
    }, [color]);

    const handleHueMove = (e: React.PointerEvent | PointerEvent) => {
        if (!wheelRef.current) return;
        const rect = wheelRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        let angle = Math.atan2(y, x);
        let hue = (angle + Math.PI / 2) / (Math.PI * 2);
        if (hue < 0) hue += 1;
        if (hue >= 1) hue -= 1;
        
        setHsv({ h: hue, s, v });
        onChange(hsvToHex(hue, s, v));
    };

    const handleSVMove = (e: React.PointerEvent | PointerEvent) => {
        if (!squareRef.current) return;
        const rect = squareRef.current.getBoundingClientRect();
        let sat = (e.clientX - rect.left) / rect.width;
        let val = 1 - ((e.clientY - rect.top) / rect.height);
        
        sat = Math.max(0, Math.min(1, sat));
        val = Math.max(0, Math.min(1, val));
        
        setHsv({ h, s: sat, v: val });
        onChange(hsvToHex(h, sat, val));
    };

    const onHueDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        handleHueMove(e);
    };
    const onHueMove = (e: React.PointerEvent) => {
        if (e.buttons > 0) handleHueMove(e);
    };

    const onSVDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        handleSVMove(e);
    };
    const onSVMove = (e: React.PointerEvent) => {
        if (e.buttons > 0) handleSVMove(e);
    };

    const hueAngle = h * Math.PI * 2 - Math.PI / 2; 

    return (
        <div className="w-56 h-56 rounded-full relative touch-none select-none" 
             ref={wheelRef} 
             style={{ background: 'conic-gradient(from 90deg, red, yellow, lime, cyan, blue, magenta, red)' }}
             onPointerDown={onHueDown}
             onPointerMove={onHueMove}
             >
            <div className="absolute inset-5 bg-[#333] rounded-full pointer-events-none"></div>
            
            <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-xl border-2 border-[#111] touch-none select-none"
                 ref={squareRef}
                 onPointerDown={(e) => { e.stopPropagation(); onSVDown(e); }}
                 onPointerMove={(e) => { e.stopPropagation(); onSVMove(e); }}
                 style={{ backgroundColor: hsvToHex(h, 1, 1) }}
                 >
                 <div className="w-full h-full pointer-events-none" style={{ background: 'linear-gradient(to right, white, transparent)' }}>
                    <div className="w-full h-full pointer-events-none" style={{ background: 'linear-gradient(to top, black, transparent)' }}></div>
                 </div>
                 
                 <div className="absolute w-4 h-4 rounded-full border-[1.5px] border-white shadow-md pointer-events-none bg-transparent"
                      style={{ 
                          left: `${s * 100}%`, top: `${(1 - v) * 100}%`, 
                          transform: 'translate(-50%, -50%)',
                          boxShadow: '0 0 0 1px rgba(0,0,0,0.8)'
                      }}>
                 </div>
            </div>
            
            <div className="absolute w-6 h-6 rounded-full border-[3px] border-white shadow-md pointer-events-none bg-transparent"
                 style={{
                     left: `calc(50% + ${Math.cos(hueAngle) * 41}%)`,
                     top: `calc(50% + ${Math.sin(hueAngle) * 41}%)`,
                     transform: 'translate(-50%, -50%)',
                     boxShadow: '0 0 0 1px rgba(0,0,0,0.8)'
                 }}>
            </div>
        </div>
    );
}


import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { DOMSerializer } from '@tiptap/pm/model';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { encryptData, decryptData } from '../lib/encryption';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import { all, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { FontSize } from '../lib/fontSizeExtension';
import { SpacingExtension } from '../lib/SpacingExtension';
import { StrokeExtension } from '../lib/StrokeExtension';
import Placeholder from '@tiptap/extension-placeholder';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import { WatermarkModal } from '../components/WatermarkModal';
import { SyntaxSlider } from '../components/SyntaxSlider';
import { EnhancedImage } from '../lib/extensions/EnhancedImage';
import { ChartBox } from '../lib/extensions/ChartBox';
import { FlowchartBox } from '../lib/extensions/FlowchartBox';
import { MangaPanel } from '../lib/extensions/MangaPanel';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { DECORATIVE_ELEMENTS } from '../lib/decorativeElements';
import { cn } from '@/src/lib/utils';
import { Button } from '../components/ui/Button';
import { signInForGoogleDocs, createGoogleDoc, exportHtmlToGoogleDoc, getDocsToken, setDocsToken } from '../utils/googleDocs';
import { signInForGoogleSlides, createGoogleSlidePresentation, getSlidesToken, setSlidesToken } from '../utils/googleSlides';
import { signInForGoogleForms, createGoogleForm, getFormsToken, setFormsToken, parseQuestionsFromHtml } from '../utils/googleForms';
import { 
  Wand2, Save, MessageSquare, Send, Bold, Italic, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight, Strikethrough, Superscript as SuperIcon, Subscript as SubIcon,
  Eraser, List, ListOrdered, CheckSquare, Quote, Code, Minus, Link as LinkIcon, Download, Undo, Redo, Eye,
  Palette, Highlighter, Sparkles, PenTool, Languages, MousePointer2, Settings, Type, LayoutList, 
  CheckCircle, FileText, Briefcase, FileCode, Search, RefreshCw, Layers, Mail, FileSearch, ListChecks, Mic, Scale, Table as TableIcon, Zap, Plus,
  Trash2, Image as ImageIcon, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Columns, Rows, FileSpreadsheet, Layout, Brain, Puzzle, ChevronDown, Blocks, Printer, X, BarChart3, Star, Share2, Sigma,
  Maximize, FileX, Scissors, Type as TypeIcon, Globe, MoveDown, BookOpen, Clock, Network, Box, StopCircle, AlertCircle, Loader2, Paperclip, ExternalLink
} from 'lucide-react';
import { askGeminiFlash, askGeminiProComplex } from '../lib/gemini';
import { LocalGemmaTerminal } from '../components/LocalGemmaTerminal';
import { MLCEngineInterface } from '@mlc-ai/web-llm';
import { marked } from 'marked';
import { HexColorPicker } from 'react-colorful';

import { RobotDictator } from '../components/RobotDictator';
import { OfflineNotepad } from '../components/OfflineNotepad';
import { Notebook } from 'lucide-react';

const sanitizeAiError = (err: any): string => {
  const errMsg = err?.message || String(err);
  if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("invalid-api-key") || errMsg.includes("API key not valid") || errMsg.includes("403") || errMsg.includes("Forbidden")) {
    return "Your Custom API Key appears to be invalid or expired. Please verify your credentials in the settings panel by selecting 'Use Custom API Key' and then try again!";
  }
  if (errMsg.includes("WebGPU") || errMsg.includes("navigator.gpu") || errMsg.includes("adapter")) {
    return "WebGPU connection failed: Your local device GPU is currently unavailable or busy. If you are inside an iframe sandbox, use the 'Open in New Tab' ↗️ link or attach your own custom cloud API Key to bypass!";
  }
  if (errMsg.includes("quota") || errMsg.includes("rate limit") || errMsg.includes("429")) {
    return "The public API rate limit has been reached. Please try again shortly, or insert your own custom API Key to enjoy uninterrupted premium access!";
  }
  if (errMsg.includes("network") || errMsg.includes("fetch") || errMsg.includes("Failed to fetch")) {
    return "Service currently unavailable due to a network connection timeout. Please check your connection and try again.";
  }
  return errMsg || "Service currently unavailable. Please verify your internet connection or use a custom API key.";
};

const DOCUMENT_THEMES: Record<string, {
  name: string;
  bgValue: string;
  textValue: string;
  outerBgValue: string;
  accentValue: string;
  borderValue: string;
}> = {
  white: {
    name: "Classic White",
    bgValue: "#FFFFFF",
    textValue: "#111827",
    outerBgValue: "#EFEFEF",
    accentValue: "#FFFFFF",
    borderValue: "#E5E7EB",
  },
  dark: {
    name: "Obsidian Black",
    bgValue: "#0B0F19",
    textValue: "#F3F4F6",
    outerBgValue: "#111827",
    accentValue: "#0B0F19",
    borderValue: "#374151",
  },
  blue: {
    name: "Royal Midnight",
    bgValue: "#0F172A",
    textValue: "#FEF3C7",
    outerBgValue: "#1E293B",
    accentValue: "#0F172A",
    borderValue: "#334155",
  },
  green: {
    name: "Emerald Serene",
    bgValue: "#064E3B",
    textValue: "#ECFDF5",
    outerBgValue: "#022C22",
    accentValue: "#064E3B",
    borderValue: "#047857",
  },
  brown: {
    name: "Vintage Sepia",
    bgValue: "#FBF0D9",
    textValue: "#2C1D11",
    outerBgValue: "#EAD8C0",
    accentValue: "#FBF0D9",
    borderValue: "#D7C49E",
  },
  yellow: {
    name: "Warm Buttercream",
    bgValue: "#FFFBEB",
    textValue: "#451A03",
    outerBgValue: "#FEF3C7",
    accentValue: "#FFFBEB",
    borderValue: "#FDE68A",
  },
  red: {
    name: "Velvet Burgundy",
    bgValue: "#4C0519",
    textValue: "#FFE4E6",
    outerBgValue: "#2D0612",
    accentValue: "#4C0519",
    borderValue: "#9D174D",
  },
  purple: {
    name: "Royal Amethyst",
    bgValue: "#3B0764",
    textValue: "#F3E8FF",
    outerBgValue: "#1E152A",
    accentValue: "#3B0764",
    borderValue: "#5B21B6",
  },
  teal: {
    name: "Cyber Teal",
    bgValue: "#042F2E",
    textValue: "#CCFBF1",
    outerBgValue: "#115E59",
    accentValue: "#042F2E",
    borderValue: "#0F766E",
  },
  mint: {
    name: "Eye-Soothing Mint",
    bgValue: "#F0FDF4",
    textValue: "#14532D",
    outerBgValue: "#DCFCE7",
    accentValue: "#F0FDF4",
    borderValue: "#86EFAC",
  }
};

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const lowlight = createLowlight(all);

  const [docTitle, setDocTitle] = useState('Untitled Document');
  const [isStarred, setIsStarred] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // New Menus State
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkModalUrl, setLinkModalUrl] = useState('https://');
  const [linkModalText, setLinkModalText] = useState('');

  const [showFileModal, setShowFileModal] = useState(false);
  const [attachedFile, setAttachedFile] = useState<any>(null);
  const [attachedFileBase64, setAttachedFileBase64] = useState<string>('');
  const [attachedFileText, setAttachedFileText] = useState<string>('');

  // Interactive Popup Media state variables
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [attachedPhotoFile, setAttachedPhotoFile] = useState<any>(null);
  const [attachedPhotoBase64, setAttachedPhotoBase64] = useState<string>('');
  const [attachedPhotoText, setAttachedPhotoText] = useState<string>('');

  const [showPopupMediaViewer, setShowPopupMediaViewer] = useState(false);
  const [popupMediaUrl, setPopupMediaUrl] = useState('');
  const [popupMediaTitle, setPopupMediaTitle] = useState('');
  const [popupMediaType, setPopupMediaType] = useState<'image' | 'pdf' | 'other'>('other');
  const [loadingPopupMedia, setLoadingPopupMedia] = useState(false);
  const [popupPhotoScale, setPopupPhotoScale] = useState(1);

  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectTargetUrl, setRedirectTargetUrl] = useState('');
  const [redirectTargetText, setRedirectTargetText] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('word');
  const [dragDropEditMode, setDragDropEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [syncStatus, setSyncStatus] = useState('All changes saved');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{role:string, content:string}[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isNexusThinking, setIsNexusThinking] = useState(false);
  const [nexusOutput, setNexusOutput] = useState<any>(null);
  const [showDocSearch, setShowDocSearch] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const saveTimeoutRef = useRef<any>(null);
  
  const [customApiKey, setCustomApiKey] = useState('');
  const [writeSeconds, setWriteSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWriteSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatWriteTime = (totalSecs: number) => {
    const mm = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const ss = (totalSecs % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };
  const [showApiKeySetting, setShowApiKeySetting] = useState(false);
  const [showAutocompleteApiKeySetting, setShowAutocompleteApiKeySetting] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [docThemeKey, setDocThemeKey] = useState(() => localStorage.getItem('doc_theme_key') || 'white');
  const [useLocalModel, setUseLocalModel] = useState(true);
  const [localEngine, setLocalEngine] = useState<MLCEngineInterface | null>(null);
  const [showNotepad, setShowNotepad] = useState(false);

  // Margin & Ruler State
  const [showRuler, setShowRuler] = useState(false);
  const [editorLeftMargin, setEditorLeftMargin] = useState(80); // Default md:px-20 padding-left
  const [editorRightMargin, setEditorRightMargin] = useState(80); // Default md:px-20 padding-right
  const [editorVerticalMargin, setEditorVerticalMargin] = useState(80); // Default padding-top/bottom

  // Mouse down drag event handlers for rulers
  const handleLeftMarginMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startMargin = editorLeftMargin;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      setEditorLeftMargin(Math.max(10, Math.min(300, startMargin + deltaX)));
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleRightMarginMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startMargin = editorRightMargin;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      setEditorRightMargin(Math.max(10, Math.min(300, startMargin - deltaX)));
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleVerticalMarginMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startMargin = editorVerticalMargin;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      setEditorVerticalMargin(Math.max(10, Math.min(300, startMargin + deltaY)));
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Voice to Doc Creator modal states
  const [showVoiceDocModal, setShowVoiceDocModal] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceResultStatus, setVoiceResultStatus] = useState<"idle" | "listening" | "researching" | "ready" | "error">("idle");
  const [voiceCreatorErrorMessage, setVoiceCreatorErrorMessage] = useState("");
  const [isGoogleDocExporting, setIsGoogleDocExporting] = useState(false);
  const [googleDocUrl, setGoogleDocUrl] = useState<string | null>(null);
  const [isGoogleSlidesExporting, setIsGoogleSlidesExporting] = useState(false);
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState<string | null>(null);
  const [isGoogleFormsExporting, setIsGoogleFormsExporting] = useState(false);
  const [googleFormsUrl, setGoogleFormsUrl] = useState<{ editUrl: string, responderUrl: string } | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('samba_custom_key');
    if (stored) {
      try {
        setCustomApiKey(decryptData(stored));
      } catch (e) {
        setCustomApiKey(stored);
      }
    }
  }, []);

  const handleCustomKeyChange = (val: string) => {
    setCustomApiKey(val);
    if (val) {
      localStorage.setItem('samba_custom_key', encryptData(val));
    } else {
      localStorage.removeItem('samba_custom_key');
    }
  };

  const toggleVoiceListening = () => {
    if (isRecordingVoice) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsRecordingVoice(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
        return;
      }
      
      try {
        const recon = new SpeechRecognition();
        recon.continuous = true;
        recon.interimResults = false;
        recon.lang = 'en-US';
        
        recon.onstart = () => {
          setIsRecordingVoice(true);
          setVoiceResultStatus("listening");
        };
        
        recon.onerror = (e: any) => {
          console.error("Speech Recognition Error", e);
          setIsRecordingVoice(false);
          setVoiceResultStatus("error");
          if (e.error === 'not-allowed') {
            setVoiceCreatorErrorMessage("Microphone permission was blocked inside the browser preview's iframe (expected sandbox security). Please type your topic directly in the text field below, or click any of our Sample Dictation buttons above to test!");
          } else {
            setVoiceCreatorErrorMessage(`Failed to capture speech: ${e.error}`);
          }
        };
        
        recon.onend = () => {
          setIsRecordingVoice(false);
        };
        
        recon.onresult = (evt: any) => {
          let finalTranscript = '';
          for (let i = evt.resultIndex; i < evt.results.length; ++i) {
            if (evt.results[i].isFinal) {
              finalTranscript += evt.results[i][0].transcript;
            }
          }
          if (finalTranscript.trim()) {
            setVoiceText((prev) => {
              const cleanedPrev = prev.trim();
              const cleanedFinal = finalTranscript.trim();
              return cleanedPrev ? cleanedPrev + " " + cleanedFinal : cleanedFinal;
            });
          }
        };
        
        recognitionRef.current = recon;
        recon.start();
      } catch (err: any) {
        console.error(err);
        setVoiceResultStatus("error");
        setVoiceCreatorErrorMessage(err.message);
      }
    }
  };

  const handleVoiceDocGeneration = async () => {
    if (!voiceText.trim()) return;
    setVoiceResultStatus("researching");
    setVoiceCreatorErrorMessage("");
    try {
      const detailedPrompt = `You are an Autonomous AI Expert Research & Document Architect.
The user has dictated a command / topic via voice: "${voiceText}"

Your task is to take this command, do comprehensive mental research, synthesize the topic, and generate a long, highly detailed, beautifully structured HTML document.

Requirements:
1. Deliver a very comprehensive, exhaustive, and professionally written full article / document.
2. Structure the document beautifully using standard HTML elements:
   - Dynamic Display Title (<h1> with inline style color accent, e.g. "color: #3b82f6" or "#8b5cf6")
   - Sub-headlines (<h2> and <h3> with inline styled colors)
   - Bulleted or numbered lists (<ul> / <ol> and <li>)
   - Paragraphs with good pacing (<p>)
   - Key terminology highlighted with the <mark> tag and custom inline styles (e.g. style="background: rgba(234, 179, 8, 0.2); border-radius: 4px; padding: 2px 4px;")
3. Crucial features to include:
   - Clickable relevant reference links (<a> tags with hrefs pointing to popular educational or technical references like wikipedia, mdn, or google). Make them look active and professional using blue inline style colors and underline.
   - Beautiful, fully formatted HTML Tables comparing properties or showing structured reference statistics.
   - Beautiful ASCII or simple formatted styled layout charts or inline diagrams to represent structures beautifully if applicable.
4. Set default reasoning perspective to Qwen 2.5 instructions (clean, rigorous, direct, factual, logical, and exhaustively precise with code/charts/detailed formatting).
5. Output ONLY the raw HTML body content inside the container. Absolutely DO NOT wrap with markdown, do not include "\`\`\`html" or "\`\`\`" markdown blocks, and no conversational preambles/postambles. The response must be 100% pure HTML ready to inject into a parent DIV in the Rich-Text editor.`;

      let generatedHtml = "";
      if (customApiKey) {
        // Bypass local model and use API
        generatedHtml = await askGeminiProComplex(detailedPrompt, customApiKey);
      } else if (localEngine) {
        // Use default local Qwen 2.5 model via WebLLM
        const response = await localEngine.chat.completions.create({
          messages: [
            { role: 'user', content: detailedPrompt }
          ],
          stream: false,
          temperature: 0.6,
          max_tokens: 3000
        });
        generatedHtml = response.choices[0]?.message?.content || "";
      } else {
        // Fallback to the cloud model proxy so it works seamlessly and cleanly
        generatedHtml = await askGeminiProComplex(detailedPrompt, "");
      }

      if (!generatedHtml) {
        throw new Error("No output was received from the AI document builder.");
      }

      const matchError = typeof generatedHtml === 'string' && (generatedHtml.startsWith("Error:") || generatedHtml.includes('"error":'));
      if (matchError) {
        let displayError = generatedHtml;
        try {
          // Attempt to extract nested message from JSON structure inside string
          const rawString = generatedHtml.replace(/^Error:\s*/, '').trim();
          if (rawString.startsWith('{')) {
            const parsed = JSON.parse(rawString);
            if (parsed.error && parsed.error.message) {
              displayError = parsed.error.message;
            } else if (parsed.message) {
              displayError = parsed.message;
            }
          }
        } catch(e) {}
        throw new Error(displayError.replace(/^Error:\s*/, ""));
      }

      let cleanHtml = generatedHtml.trim();
      if (cleanHtml.startsWith("```html")) {
        cleanHtml = cleanHtml.replace(/^```html\s*/i, "").replace(/\s*```$/i, "");
      } else if (cleanHtml.startsWith("```")) {
        cleanHtml = cleanHtml.replace(/^```\s*/i, "").replace(/\s*```$/i, "");
      }

      editor?.commands.setContent(cleanHtml);
      handleDocSave();

      setVoiceResultStatus("ready");
    } catch (err: any) {
      console.error(err);
      setVoiceResultStatus("error");
      setVoiceCreatorErrorMessage(sanitizeAiError(err));
    }
  };

  const handleExportToGoogleDoc = async () => {
    if (!editor) return;
    setIsGoogleDocExporting(true);
    setGoogleDocUrl(null);
    try {
      let currentToken = getDocsToken();
      if (!currentToken) {
        currentToken = await signInForGoogleDocs();
      }
      
      const title = docTitle || "DocCraft Voice-to-Doc";
      const htmlContent = editor.getHTML();
      
      // Create new Google Doc
      const docId = await createGoogleDoc(title, currentToken);
      
      // Export content
      const url = await exportHtmlToGoogleDoc(docId, htmlContent, currentToken);
      setGoogleDocUrl(url);
      window.open(url, '_blank');
    } catch (err: any) {
      console.error(err);
      alert(`Export to Google Docs failed: ${err.message}`);
      setDocsToken(null);
    } finally {
      setIsGoogleDocExporting(false);
    }
  };

  const handleExportToGoogleSlides = async () => {
    if (!editor) return;
    setIsGoogleSlidesExporting(true);
    setGoogleSlidesUrl(null);
    try {
      let currentToken = getSlidesToken();
      if (!currentToken) {
        currentToken = await signInForGoogleSlides();
      }
      
      const title = docTitle || "DocCraft Workspace Presentation";
      const htmlContent = editor.getHTML();
      
      const parseSlidesFromHtml = (htmlStr: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlStr, 'text/html');
        const list: { heading: string, bullets: string[] }[] = [];
        let current: { heading: string, bullets: string[] } | null = null;
        
        doc.body.childNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tagName = el.tagName.toLowerCase();
            if (tagName.match(/h[1-6]/)) {
              if (current) list.push(current);
              current = { heading: el.textContent?.trim() || 'Slide', bullets: [] };
            } else {
              const txt = el.textContent?.trim() || '';
              if (txt && current) {
                if (tagName === 'ul' || tagName === 'ol') {
                  el.querySelectorAll('li').forEach(li => {
                    const liTxt = li.textContent?.trim() || '';
                    if (liTxt) current!.bullets.push(liTxt);
                  });
                } else if (txt.length < 300) {
                  current.bullets.push(txt);
                } else {
                  current.bullets.push(txt.substring(0, 300) + '...');
                }
              }
            }
          }
        });
        if (current) list.push(current);
        if (list.length === 0) {
          list.push({ heading: docTitle || 'DocCraft Slide', bullets: [doc.body.textContent?.trim()?.substring(0, 300) || ''] });
        }
        return list;
      };

      const slidesData = parseSlidesFromHtml(htmlContent);
      const url = await createGoogleSlidePresentation(title, slidesData, currentToken);
      setGoogleSlidesUrl(url);
      window.open(url, '_blank');
    } catch (err: any) {
      console.error(err);
      alert(`Export to Google Slides failed: ${err.message}`);
      setSlidesToken(null);
    } finally {
      setIsGoogleSlidesExporting(false);
    }
  };

  const handleExportToGoogleForms = async () => {
    if (!editor) return;
    setIsGoogleFormsExporting(true);
    setGoogleFormsUrl(null);
    try {
      let currentToken = getFormsToken();
      if (!currentToken) {
        currentToken = await signInForGoogleForms();
      }
      
      const title = docTitle || "DocCraft Custom Survey";
      const htmlContent = editor.getHTML();
      const questions = parseQuestionsFromHtml(htmlContent);
      
      const urls = await createGoogleForm(title, questions, currentToken);
      setGoogleFormsUrl(urls);
      window.open(urls.editUrl, '_blank');
    } catch (err: any) {
      console.error(err);
      alert(`Export to Google Forms failed: ${err.message}`);
      setFormsToken(null);
    } finally {
      setIsGoogleFormsExporting(false);
    }
  };

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    if (!user || !docSearchQuery) {
      setSearchResults([]);
      return;
    }
    const fetchDocs = async () => {
      const q = query(
        collection(db, 'documents'),
        where('ownerId', '==', user.uid),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .filter(d => d.title.toLowerCase().includes(docSearchQuery.toLowerCase()));
      setSearchResults(docs);
    };
    fetchDocs();
  }, [docSearchQuery, user]);



  const handleFileExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let extractedText = '';
      if (file.type === 'text/plain' || file.name.endsWith('.csv') || file.name.endsWith('.md')) {
        extractedText = await file.text();
      } else if (file.name.endsWith('.html')) {
        const text = await file.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        extractedText = doc.body.innerText || doc.body.textContent || '';
      } else if (file.name.endsWith('.pdf')) {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n\n';
        }
        extractedText = text;
      } else if (file.name.endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (file.name.endsWith('.zip')) {
        const JSZip = await import('jszip');
        const zip = await JSZip.default.loadAsync(file);
        let text = '';
        for (const [filename, zipEntry] of Object.entries(zip.files)) {
          if (!zipEntry.dir && (filename.endsWith('.txt') || filename.endsWith('.json') || filename.endsWith('.md'))) {
            const content = await zipEntry.async('string');
            text += `\n\n--- ${filename} ---\n\n${content}`;
          }
        }
        extractedText = text;
      } else {
        alert('Unsupported file format context.');
        return;
      }

      if (extractedText && editor) {
        editor.chain().insertContent(extractedText).run();
      }
    } catch (err) {
      console.error(err);
      alert('Error extracting text from file.');
    }
  };

  const handlePluginAction = (pid: string) => {
    if (!editor) return;
    
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    );
    const fullText = editor.getText();
    
    switch (pid) {
      case '1': // Word Counter
        const words = (fullText.match(/\b[-?(\w+)?]+\b/gi) || []).length;
        const chars = fullText.length;
        alert(`Document Stats:\nWords: ${words}\nCharacters: ${chars}`);
        break;
      case '2': // Read Time
        const wpm = 225;
        const totalWords = (fullText.match(/\b[-?(\w+)?]+\b/gi) || []).length;
        const minutes = Math.ceil(totalWords / wpm);
        alert(`Estimated Reading Time: ${minutes} min`);
        break;
      case '3': // TTS
        if ('speechSynthesis' in window) {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          } else {
            const utterance = new SpeechSynthesisUtterance(selectedText || fullText);
            window.speechSynthesis.speak(utterance);
          }
        } else {
          alert('Text-to-speech not supported in this browser.');
        }
        break;
      case '4': // Case Converter
        if (selectedText) {
          editor.commands.insertContent(selectedText.toUpperCase());
        } else {
          alert('Please select some text to convert uppercase.');
        }
        break;
      case '5': // Lorem Ipsum
        editor.commands.insertContent('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');
        break;
      case '6': // Clean Empty Lines
        const newHtml = editor.getHTML().replace(/<p><\/p>/g, '');
        editor.commands.setContent(newHtml);
        break;
      case '7': // HTML to Markdown
        const md = marked(editor.getHTML());
        alert('Document markdown is available. We will save it to clipboard.');
        navigator.clipboard.writeText(String(md)).catch(console.error);
        break;
      case '8': // Secret Code
        if (selectedText) {
          editor.commands.insertContent(btoa(selectedText));
        } else {
          alert('Please select some text to encode to Base64.');
        }
        break;
      case '9': // Dictionary
        if (selectedText) {
           window.open(`https://en.wiktionary.org/wiki/${encodeURIComponent(selectedText.trim())}`, '_blank');
        } else {
          alert('Please select a word to lookup.');
        }
        break;
      case '10': // Typewriter Sounds
        alert('Typewriter sounds activated! Just keep typing (ensure volume is up).');
        const audio = new Audio('https://actions.google.com/sounds/v1/water/wood_block_echo.ogg');
        audio.volume = 0.2;
        editor.on('update', () => {
          audio.currentTime = 0;
          audio.play().catch(()=>{});
        });
        break;
      case '11': // JSON Prettifier
        if (selectedText) {
          try {
            const parsed = JSON.parse(selectedText);
            editor.commands.insertContent(`<pre><code>${JSON.stringify(parsed, null, 2)}</code></pre>`);
          } catch (e) {
            alert('Selected text is not valid JSON.');
          }
        }
        break;
      case '12': // URL Encoder
        if (selectedText) {
          editor.commands.insertContent(encodeURIComponent(selectedText));
        }
        break;
      case '13': // Extract Emails
        const emails = fullText.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/gi);
        if (emails) {
          alert(`Found ${emails.length} emails. Unique list has been copied to clipboard.`);
          navigator.clipboard.writeText([...new Set(emails)].join('\n')).catch(console.error);
        } else {
          alert('No emails found in the document.');
        }
        break;
      case '14': // Extract URLs
        const urls = fullText.match(/(https?:\/\/[^\s]+)/g);
        if (urls) {
          alert(`Found ${urls.length} URLs. Unique list has been copied to clipboard.`);
          navigator.clipboard.writeText([...new Set(urls)].join('\n')).catch(console.error);
        } else {
          alert('No URLs found in the document.');
        }
        break;
      case '15': // Remove Duplicates
        if (selectedText) {
          const lines = selectedText.split('\n');
          editor.commands.insertContent([...new Set(lines)].join('\n'));
        }
        break;
      case '16': // Sort Alphabetically
        if (selectedText) {
          const lines = selectedText.split('\n');
          editor.commands.insertContent(lines.sort().join('\n'));
        }
        break;
      case '17': // Shuffle
        if (selectedText) {
          const lines = selectedText.split('\n');
          for (let i = lines.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lines[i], lines[j]] = [lines[j], lines[i]];
          }
          editor.commands.insertContent(lines.join('\n'));
        }
        break;
      case '18': // Remove Spaces
        if (selectedText) {
          editor.commands.insertContent(selectedText.replace(/\s+/g, ' ').trim());
        } else {
          editor.commands.setContent(editor.getHTML().replace(/&nbsp;/g, ' ').replace(/\s+/g, ' '));
        }
        break;
      case '19': // Snake Case
        if (selectedText) {
          editor.commands.insertContent(selectedText.replace(/ /g, '_').toLowerCase());
        }
        break;
      case '20': // Camel Case
        if (selectedText) {
          const cc = selectedText.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
          editor.commands.insertContent(cc);
        }
        break;
      case '21': // Pascal Case
        if (selectedText) {
          const pc = selectedText.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '');
          editor.commands.insertContent(pc);
        }
        break;
      case '22': // Hex to RGB
        if (selectedText) {
          const hex = selectedText.replace(/^#/, '');
          if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            editor.commands.insertContent(`rgb(${r}, ${g}, ${b})`);
          } else {
            alert('Invalid hex code selected.');
          }
        }
        break;
      case '23': // Reverse Text
        if (selectedText) {
          editor.commands.insertContent(selectedText.split('').reverse().join(''));
        }
        break;
      case '24': // Base32
        alert('Base32 encoding is currently limited in local JS. Using Base64 (btoa) fallback.');
        if (selectedText) {
          editor.commands.insertContent(btoa(selectedText));
        }
        break;
      case '25': // ROT13
        if (selectedText) {
          const rot13 = selectedText.replace(/[a-zA-Z]/g, (char) => {
            const code = char.charCodeAt(0);
            const isUpper = char <= 'Z';
            const limit = isUpper ? 90 : 122;
            const rotated = code + 13;
            return String.fromCharCode(limit >= rotated ? rotated : rotated - 26);
          });
          editor.commands.insertContent(rot13);
        }
        break;
      case '26': // Text Statistics
        if (selectedText || fullText) {
          const text = selectedText || fullText;
          const charCount = text.length;
          const wordCount = (text.match(/\b[-?(\w+)?]+\b/gi) || []).length;
          const sentenceCount = (text.match(/[.!?]+/g) || []).length || 1;
          const avgWordLength = (charCount / wordCount).toFixed(2);
          alert(`Text Statistics:\nWords: ${wordCount}\nCharacters: ${charCount}\nSentences: ${sentenceCount}\nAvg. Word Length: ${avgWordLength} characters`);
        }
        break;
      case '27': // List Numbering
        if (selectedText) {
          const lines = selectedText.split('\n');
          editor.commands.insertContent(lines.map((l, i) => `${i + 1}. ${l}`).join('\n'));
        }
        break;
      case '28': // Math Evaluator
        if (selectedText) {
          try {
            // Unsafe eval for simple math via Function
            const result = new Function(`return ${selectedText}`)();
            editor.commands.insertContent(`${selectedText} = ${result}`);
          } catch (e) {
            alert('Cannot evaluate the selected math expression.');
          }
        }
        break;
    }
  };

  const isInitialMount = useRef(true);
  
  // Custom Popover States
  const [showSyntaxSlider, setShowSyntaxSlider] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);
  const [watermarkInitialImage, setWatermarkInitialImage] = useState<string | undefined>();

  useEffect(() => {
    const handleOpenWatermark = (e: any) => {
        setWatermarkInitialImage(e.detail);
        setShowWatermarkModal(true);
    };
    window.addEventListener('open-watermark', handleOpenWatermark);
    return () => window.removeEventListener('open-watermark', handleOpenWatermark);
  }, []);
  
  const [tempColor, setTempColor] = useState('#000000');
  const [tempHighlightColor, setTempHighlightColor] = useState('#FEF08A');
  const [tempStrokeColor, setTempStrokeColor] = useState('#000000');
  
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showLineHeightMenu, setShowLineHeightMenu] = useState(false);
  const [showStrokeMenu, setShowStrokeMenu] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [showChatPlusMenu, setShowChatPlusMenu] = useState(false);
  const [showElementPanel, setShowElementPanel] = useState(false);
  const [showSymbolMenu, setShowSymbolMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState('Spanish');
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const tableImageUploadRef = useRef<HTMLInputElement>(null);

  const handleTableImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        // Set image max-width for compatibility in cells
        editor?.chain().setImage({ src: dataUrl }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTableAddLink = () => {
    const url = window.prompt('Enter link URL:');
    if (url) {
      editor?.chain().setLink({ href: url }).run();
    }
  };

  // Draw constraints
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      SpacingExtension,
      StrokeExtension,
      EnhancedImage,
      ChartBox,
      FlowchartBox,
      MangaPanel,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-fixed w-full border-2 border-gray-900 rounded-sm',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 border-b-[3px] border-b-gray-900 bg-gray-50 px-4 py-3 font-bold text-left text-gray-900 uppercase tracking-wider text-[11px] relative',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-200 px-4 py-3 text-sm text-gray-600 relative break-words',
        },
      }),
      Dropcursor.configure({
        color: '#D4AF37',
        width: 3,
        class: 'custom-dropcursor',
      }),
      Gapcursor,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Superscript,
      Subscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ 
         openOnClick: false, 
         autolink: true,
         validate: href => true,
         protocols: ['http', 'https', 'mailto', 'tel', 'data'],
         HTMLAttributes: {
           target: '_blank',
           rel: 'noopener noreferrer',
           class: 'text-blue-600 underline cursor-pointer'
         }
      }),
      Placeholder.configure({
        placeholder: 'Start typing your professional document...',
      })
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (!id || id === 'new') return;
      
      // Advanced Editor Features Logic
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;
      const currentLineText = $from.nodeBefore?.text || '';

      // [[ Trigger Logic
      if (currentLineText.endsWith('[[')) {
         setShowDocSearch(true);
         setDocSearchQuery('');
      } else {
         if (showDocSearch && !currentLineText.includes('[[')) {
            setShowDocSearch(false);
         }
      }

      setSyncStatus('Saving...');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await updateDoc(doc(db, 'documents', id), {
            content: encryptData(editor.getHTML()),
            updatedAt: serverTimestamp()
          });
          setSyncStatus('All changes saved');
        } catch (e) {
          setSyncStatus('Error saving');
        }
      }, 1500);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert focus:outline-none max-w-none min-h-[700px] outline-none',
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        const anchor = target.closest('a');
        if (anchor) {
          const href = anchor.getAttribute('href');
          if (href) {
            event.preventDefault();
            event.stopPropagation();
            
            // 1. Handled Clickable Interactive Pop-ups (Photo or Attachment)
            if (href.startsWith('popup-photo:') || href.includes('/api/attachments/')) {
              triggerPopupMediaView(href, anchor.innerText || href);
              return true;
            }
            
            // 2. Base64 Image preview popup fallback
            if (href.startsWith('data:image/')) {
              setPopupMediaUrl(href);
              setPopupMediaType('image');
              setPopupMediaTitle(anchor.innerText || 'Embedded Image');
              setPopupPhotoScale(1);
              setShowPopupMediaViewer(true);
              return true;
            }

            // 3. Built-in files / other local downloads
            if (href.startsWith('data:')) {
              const downloadName = anchor.getAttribute('download') || 'downloaded-file';
              const link = document.createElement('a');
              link.href = href;
              link.download = downloadName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              return true;
            }
            
            // 4. Fallback to Redirect confirmation for ordinary external links
            setRedirectTargetUrl(href);
            setRedirectTargetText(anchor.innerText || href);
            setShowRedirectModal(true);
            return true;
          }
        }
        return false;
      }
    },
  });

  const handleDocSave = async () => {
    if (!id || !editor || id === 'new') return;
    setSyncStatus('Saving...');
    try {
      await updateDoc(doc(db, 'documents', id), {
        content: encryptData(editor.getHTML()),
        updatedAt: serverTimestamp()
      });
      setSyncStatus('All changes saved');
    } catch (e) {
      setSyncStatus('Error saving');
    }
  };

  useEffect(() => {
    const appliedImage = localStorage.getItem('clipper_applied_image');
    if (appliedImage && editor) {
       editor.commands.focus();
       editor.commands.setImage({ src: appliedImage });
       localStorage.removeItem('clipper_applied_image');
    }
  }, [editor]);

  useEffect(() => {
    async function loadOrCreateDoc() {
      if (!user) return;
      if (id === 'new') {
        // Create new document in Firebase
        const newDocRef = doc(collection(db, 'documents'));
        await setDoc(newDocRef, {
          title: 'Untitled Document',
          content: encryptData(''),
          ownerId: user.uid,
          isPinned: false,
          isArchived: false,
          isStarred: false,
          isShared: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        navigate(`/doc/${newDocRef.id}`, { replace: true });
        return;
      }
      if (id) {
        const docSnap = await getDoc(doc(db, 'documents', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDocTitle(data.title || 'Untitled Document');
          setIsStarred(data.isStarred || false);
          setIsShared(data.isShared || false);
          if (editor && !editor.isDestroyed) {
             editor.commands.setContent(decryptData(data.content || ''));
             
             // Check for pending custom element from Studio AFTER content is loaded
              const pendingElement = localStorage.getItem('pending_studio_element');
              if (pendingElement) {
                setTimeout(() => {
                   try {
                     const endPos = editor.state.doc.content.size;
                     editor.commands.insertContentAt(endPos, { type: 'image', attrs: { src: pendingElement, align: 'center', width: '400px', isFreestyle: true } });
                     handleDocSave();
                   } catch (e) {}
                }, 150);
                localStorage.removeItem('pending_studio_element');
              }

              // Check for pending chart element from Charts Library
              const pendingChart = localStorage.getItem('pending_chart_element');
              if (pendingChart) {
                setTimeout(() => {
                   try {
                     const c = JSON.parse(pendingChart);
                     const endPos = editor.state.doc.content.size;
                     editor.commands.insertContentAt(endPos, { type: 'chartBox', attrs: { title: c.title, chartType: c.type, color: c.color, width: '100%' } });
                     handleDocSave();
                   } catch (e) {
                     console.error("Failed to insert pending chart:", e);
                   }
                }, 150);
                localStorage.removeItem('pending_chart_element');
              }

              // Check for pending manga frame element
              const pendingMangaFrame = localStorage.getItem('pending_manga_frame');
              if (pendingMangaFrame) {
                setTimeout(() => {
                   try {
                     let customLayout = null;
                     if (pendingMangaFrame === 'custom') {
                        const storedCustom = localStorage.getItem('pending_manga_custom_layout');
                        if (storedCustom) {
                           customLayout = JSON.parse(storedCustom);
                           localStorage.removeItem('pending_manga_custom_layout');
                        }
                     }
                     const endPos = editor.state.doc.content.size;
                     editor.commands.insertContentAt(endPos, { type: 'mangaPanel', attrs: { frameId: pendingMangaFrame, customLayout, width: '100%', height: 600 } });
                     handleDocSave();
                   } catch (e) {}
                }, 150);
                localStorage.removeItem('pending_manga_frame');
              }

              // Check for pending table element from Charts Library
              const pendingTable = localStorage.getItem('pending_table_element');
              if (pendingTable) {
                setTimeout(() => {
                   try {
                     const endPos = editor.state.doc.content.size;
                     editor.commands.insertContentAt(endPos, pendingTable);
                     handleDocSave();
                   } catch (e) {}
                }, 150);
                localStorage.removeItem('pending_table_element');
              }
              // Check for pending math element
              const pendingMath = localStorage.getItem('pending_math_element');
              if (pendingMath) {
                setTimeout(() => {
                   try {
                     const endPos = editor.state.doc.content.size;
                     editor.commands.insertContentAt(endPos, `<p>$ ${pendingMath} $</p>`);
                     handleDocSave();
                   } catch (e) {}
                }, 150);
                localStorage.removeItem('pending_math_element');
              }
          }
        } else {
          // Document not found
          navigate('/dashboard', { replace: true });
        }
      }
    }
    
    if (editor && isInitialMount.current) {
        loadOrCreateDoc();
        isInitialMount.current = false;
    }
  }, [id, user, navigate, editor]);

  // Title save handler
  const handleTitleChange = (newTitle: string) => {
    setDocTitle(newTitle);
    if (!id || id === 'new') return;
    setSyncStatus('Saving...');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'documents', id), {
          title: newTitle,
          updatedAt: serverTimestamp()
        });
        setSyncStatus('All changes saved');
      } catch (e) {
        setSyncStatus('Error saving');
      }
    }, 1000);
  };

  const handleEnhanceDoc = async () => {
    if (!editor) return;
    const text = editor.getHTML();
    if (!text || text === '<p></p>') return;

    setSaving(true);
    setSyncStatus('Enhancing document...');
    
    try {
      const response = await fetch('/api/ai/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, customApiKey })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to enhance text');
      
      editor.commands.setContent(data.enhancedText);
      setSyncStatus('Enhancement complete');
    } catch (e: any) {
      alert("Enhancement Error: " + e.message);
      setSyncStatus('Enhancement failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAiAssist = async () => {
    if (!editor) return;
    const text = editor.getText();
    const prompt = `Write a creative and professional next paragraph continuing from this text:\n\n${text}`;
    setSaving(true);
    setIsProcessingAI(true);
    try {
      let completion = "";
      if (useLocalModel && localEngine && !customApiKey) {
        const asyncChunkGenerator = await localEngine.chat.completions.create({
          messages: [
            { role: 'user', content: 'You are an AI auto-completion engine. Provide strictly only the next paragraph text. Do not add conversational wrapper text or markdown.\n\n' + prompt }
          ],
          stream: false,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 512,
          repetition_penalty: 1.1
        });
        completion = asyncChunkGenerator.choices[0]?.message?.content || "";
      } else {
        completion = (await askGeminiFlash(prompt, customApiKey)) || "";
      }

      if (completion && (completion.startsWith("Error:") || completion.includes('"error":'))) {
        let displayError = completion;
        try {
          const rawString = completion.replace(/^Error:\s*/, '').trim();
          if (rawString.startsWith('{')) {
            const parsed = JSON.parse(rawString);
            if (parsed.error && parsed.error.message) {
              displayError = parsed.error.message;
            } else if (parsed.message) {
              displayError = parsed.message;
            }
          }
        } catch(e) {}
        throw new Error(displayError.replace(/^Error:\s*/, ""));
      }

      completion = completion.replace(/^```(markdown|text|html)?\n/i, '').replace(/```$/g, '').trim();
      let htmlResponse = completion;
      try {
         htmlResponse = await marked.parse(completion, { async: true });
      } catch (e) {
         htmlResponse = completion;
      }
      editor.commands.insertContent(`\n\n${htmlResponse}`);
    } catch(err: any) {
      alert(sanitizeAiError(err));
    } finally {
      setSaving(false);
      setIsProcessingAI(false);
    }
  };

  const handleSendPrompt = async (overrideQ?: string) => {
    const q = overrideQ || chatInput.trim();
    if(!q || loadingMsg) return;
    setChatInput('');
    setChatLog(p => [...p, {role:'user', content: q}]);
    setLoadingMsg(true);

    try {
      const docContext = editor?.getText() || "";
      const prompt = `You are a helpful AI assistant. Answer the user query based on the following context.
      Context: "${docContext}"
      
      Query: ${q}`;
      
      let res = "";
      if (useLocalModel && localEngine && !customApiKey) {
        setLoadingMsg(true);
        const asyncChunkGenerator = await localEngine.chat.completions.create({
          messages: [
            { role: 'user', content: 'You are an AI assistant. Answer the user query based on context.\n\n' + prompt }
          ],
          stream: false,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 512,
          repetition_penalty: 1.1
        });
        res = asyncChunkGenerator.choices[0]?.message?.content || "";
      } else {
        res = (await askGeminiProComplex(prompt, customApiKey)) || "";
      }

      if (res && (res.startsWith("Error:") || res.includes('"error":'))) {
        let displayError = res;
        try {
          const rawString = res.replace(/^Error:\s*/, '').trim();
          if (rawString.startsWith('{')) {
            const parsed = JSON.parse(rawString);
            if (parsed.error && parsed.error.message) {
              displayError = parsed.error.message;
            } else if (parsed.message) {
              displayError = parsed.message;
            }
          }
        } catch(e) {}
        throw new Error(displayError.replace(/^Error:\s*/, ""));
      }

      setChatLog(p => [...p, {role:'model', content: res}]);
    } catch(e: any) {
       setChatLog(p => [...p, {role:'model', content: 'Error: ' + e.message}]);
    } finally {
       setLoadingMsg(false);
    }
  };

  const quickChatFeatures = [
    { label: 'Executive Summary', icon: <Mail className="w-3.5 h-3.5" />, prompt: 'Write an executive summary of this document, structured for a fast read in an email.' },
    { label: 'Find Flaws', icon: <FileSearch className="w-3.5 h-3.5" />, prompt: 'Point out any logical flaws, inconsistencies, or weak points in this document.' },
    { label: 'Extract Tasks', icon: <ListChecks className="w-3.5 h-3.5" />, prompt: 'Extract all actionable tasks or implied next steps into a clear markdown checklist.' },
    { label: 'Devil\'s Advocate', icon: <Scale className="w-3.5 h-3.5" />, prompt: 'Act as a devil\'s advocate and propose the strongest counter-arguments to this document.' },
    { label: 'Pitch like Jobs', icon: <Mic className="w-3.5 h-3.5" />, prompt: 'Rewrite the core message of this document as if Steve Jobs was introducing it on stage.' },
    { label: 'Data to Tables', icon: <TableIcon className="w-3.5 h-3.5" />, prompt: 'Find any statistics, numbers, or metrics in this document and format them into a markdown table.' },
  ];

  const addLink = () => {
    if (!editor) return;
    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to) || '';
    const previousUrl = editor.getAttributes('link').href || '';
    if (previousUrl.includes('/api/attachments/') || previousUrl.includes('popup-photo:') || previousUrl.includes('ais-dev') || previousUrl.includes('run.app')) {
      setLinkModalUrl('https://');
    } else {
      setLinkModalUrl(previousUrl || 'https://');
    }
    setLinkModalText(selectedText);
    setShowLinkModal(true);
  };

  const applyRedirectLink = () => {
    if (!editor) return;
    let targetUrl = linkModalUrl.trim();
    if (targetUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setShowLinkModal(false);
      return;
    }

    // Standardize URL
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('mailto:') && !targetUrl.startsWith('tel:') && !targetUrl.startsWith('/') && !targetUrl.startsWith('#')) {
      targetUrl = 'https://' + targetUrl;
    }

    const displayText = linkModalText.trim() || targetUrl;

    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${targetUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: targetUrl }).run();
    }
    
    setShowLinkModal(false);
  };

  const applyFileAttachmentLink = async () => {
    if (!editor || !attachedFileBase64) return;
    setSaving(true);
    setSyncStatus('Uploading file attachment...');
    try {
      const attachmentId = doc(collection(db, 'doc_attachments')).id;
      await setDoc(doc(db, 'doc_attachments', attachmentId), {
         filename: attachedFile?.name || 'file',
         contentType: attachedFile?.type || 'application/octet-stream',
         data: attachedFileBase64,
         createdAt: serverTimestamp()
      });
      
      const downloadUrl = `${window.location.origin}/api/attachments/${attachmentId}`;
      const displayText = attachedFileText.trim() || attachedFile?.name || 'Attached File';
      const attachmentHtml = `<a href="${downloadUrl}" download="${attachedFile?.name || 'file'}" class="text-blue-600 underline font-medium bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1">📎 ${displayText}</a>&nbsp;`;
      editor.chain().focus().insertContent(attachmentHtml).run();
      
      setShowFileModal(false);
      setAttachedFile(null);
      setAttachedFileBase64('');
      setAttachedFileText('');
      setSyncStatus('All changes saved');
    } catch(err: any) {
      console.error("Failed to upload attachment:", err);
      // Fallback to local Base64 embedded URL if Firestore fails
      const displayText = attachedFileText.trim() || attachedFile?.name || 'Attached File';
      const attachmentHtml = `<a href="${attachedFileBase64}" download="${attachedFile?.name || 'file'}" class="text-blue-600 underline font-medium bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1">📎 ${displayText}</a>&nbsp;`;
      editor.chain().focus().insertContent(attachmentHtml).run();
      setShowFileModal(false);
      setAttachedFile(null);
      setAttachedFileBase64('');
      setAttachedFileText('');
      setSyncStatus('Attachment added as backup link');
    } finally {
      setSaving(false);
    }
  };

  const applyPhotoAttachmentLink = async () => {
    if (!editor || !attachedPhotoBase64) return;
    setSaving(true);
    setSyncStatus('Uploading photo attachment...');
    try {
      const attachmentId = doc(collection(db, 'doc_attachments')).id;
      await setDoc(doc(db, 'doc_attachments', attachmentId), {
         filename: attachedPhotoFile?.name || 'photo.png',
         contentType: attachedPhotoFile?.type || 'image/png',
         data: attachedPhotoBase64,
         createdAt: serverTimestamp()
      });
      
      const popupUrl = `popup-photo:${attachmentId}`;
      const displayText = attachedPhotoText.trim() || attachedPhotoFile?.name || 'View Photo';
      const attachmentHtml = `<a href="${popupUrl}" class="text-pink-600 hover:text-pink-700 underline font-semibold cursor-pointer inline-flex items-center gap-1">🖼️ ${displayText}</a>&nbsp;`;
      editor.chain().focus().insertContent(attachmentHtml).run();
      
      setShowPhotoModal(false);
      setAttachedPhotoFile(null);
      setAttachedPhotoBase64('');
      setAttachedPhotoText('');
      setSyncStatus('All changes saved');
    } catch(err: any) {
      console.error("Failed to upload photo attachment:", err);
      const fallbackUrl = `popup-photo:${attachedPhotoBase64}`;
      const displayText = attachedPhotoText.trim() || attachedPhotoFile?.name || 'View Photo';
      const attachmentHtml = `<a href="${fallbackUrl}" class="text-pink-600 hover:text-pink-700 underline font-semibold cursor-pointer inline-flex items-center gap-1">🖼️ ${displayText}</a>&nbsp;`;
      editor.chain().focus().insertContent(attachmentHtml).run();
      
      setShowPhotoModal(false);
      setAttachedPhotoFile(null);
      setAttachedPhotoBase64('');
      setAttachedPhotoText('');
      setSyncStatus('Photo link added as local backup');
    } finally {
      setSaving(false);
    }
  };

  const triggerPopupMediaView = async (href: string, text: string) => {
    setPopupMediaTitle(text || 'Attached Media');
    setPopupMediaUrl('');
    setPopupPhotoScale(1);
    setLoadingPopupMedia(true);
    setShowPopupMediaViewer(true);

    if (href.startsWith('popup-photo:')) {
      const payload = href.substring('popup-photo:'.length);
      if (payload.startsWith('data:')) {
        setPopupMediaUrl(payload);
        setPopupMediaType('image');
        setLoadingPopupMedia(false);
      } else {
        try {
          const docRef = doc(db, 'doc_attachments', payload);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPopupMediaUrl(data.data || '');
            setPopupMediaType('image');
          } else {
            alert('File attachment could not be found in the database.');
            setShowPopupMediaViewer(false);
          }
        } catch (err) {
          console.error("Error loading image attachment:", err);
          setPopupMediaUrl(`${window.location.origin}/api/attachments/${payload}`);
          setPopupMediaType('image');
        } finally {
          setLoadingPopupMedia(false);
        }
      }
    } else if (href.includes('/api/attachments/')) {
      const parts = href.split('/');
      const attachmentId = parts[parts.length - 1];
      try {
        const docRef = doc(db, 'doc_attachments', attachmentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const mime = data.contentType || 'application/octet-stream';
          const payload = data.data || '';
          
          setPopupMediaUrl(payload);
          setPopupMediaTitle(data.filename || text || 'Attachment');
          
          if (mime.startsWith('image/')) {
            setPopupMediaType('image');
          } else if (mime === 'application/pdf') {
            setPopupMediaType('pdf');
          } else {
            setPopupMediaType('other');
          }
        } else {
          setPopupMediaUrl(href);
          setPopupMediaType('other');
        }
      } catch (err) {
        console.error("Error loading attachment:", err);
        setPopupMediaUrl(href);
        setPopupMediaType('other');
      } finally {
        setLoadingPopupMedia(false);
      }
    } else {
      // Normal external link - should never really hit here but just in case
      setPopupMediaUrl(href);
      setPopupMediaType('other');
      setLoadingPopupMedia(false);
    }
  };

  const handleDownloadFromViewer = () => {
    if (!popupMediaUrl) return;
    const link = document.createElement('a');
    link.href = popupMediaUrl;
    link.download = popupMediaTitle || 'downloaded-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (format: string) => {
    // Attempt standard download flow. (Uses blob/a-tag or html2pdf.js)
    const contentHtml = editor?.getHTML() || '';
    const contentText = editor?.getText() || '';
    let blob;
    let filename = (docTitle || 'document');

    const addWatermark = () => {};

    const removeWatermark = () => {
       const wm = document.getElementById('export-watermark');
       if (wm && wm.parentNode) wm.parentNode.removeChild(wm);
    };

    if (format === 'txt') {
        blob = new Blob([contentText], { type: 'text/plain' });
        filename += '.txt';
    } else if (format === 'md') {
        blob = new Blob([contentHtml], { type: 'text/markdown' });
        filename += '.md';
    } else if (format === 'html') {
        blob = new Blob([`<div style="padding: 20px; font-family: sans-serif;">${contentHtml}</div>`], { type: 'text/html' });
        filename += '.html';
    } else if (format === 'pdf') {
       setSaving(true);
       try {
           const html2pdfModule = await import('html2pdf.js');
           const html2pdf = html2pdfModule.default ? html2pdfModule.default : html2pdfModule;
           
           addWatermark();
           const element = document.querySelector('.ProseMirror') as HTMLElement;
           if (!element) return;
           
           const opt: any = {
             margin:       [10, 10, 10, 10],
             filename:     `${filename}.pdf`,
             image:        { type: 'jpeg', quality: 0.98 },
             html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 1024, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0 },
             jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
             pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
           };
           
           // Fix for hidden/blank renders: Mount a wrapper matching the layout viewport scroll offset
            const parent = document.createElement('div');
            parent.className = 'light pdf-export-parent';
            const styleTag = document.createElement('style');
            styleTag.innerHTML = `
              .pdf-export-parent { 
                 background-color: #ffffff !important; 
                 color: #111111 !important;
              } 
              .pdf-export-parent * { 
                 text-shadow: none !important; 
                 box-shadow: none !important; 
              } 
              .pdf-export-parent h1, .pdf-export-parent h2, .pdf-export-parent h3, .pdf-export-parent h4 { 
                 color: #111111 !important; 
                 font-weight: bold !important;
                 margin-top: 12px !important;
                 margin-bottom: 8px !important;
              }
              .pdf-export-parent p, .pdf-export-parent li, .pdf-export-parent span, .pdf-export-parent strong, .pdf-export-parent div, .pdf-export-parent pre, .pdf-export-parent code { 
                 color: #222222 !important; 
              } 
              .pdf-export-parent table {
                 width: 100% !important;
                 border-collapse: collapse !important;
                 margin-top: 15px !important;
                 margin-bottom: 15px !important;
                 page-break-inside: avoid !important;
              }
              .pdf-export-parent th, .pdf-export-parent td { 
                 border: 1px solid #cccccc !important; 
                 color: #111111 !important; 
                 background-color: #ffffff !important; 
                 padding: 8px !important;
              } 
              .pdf-export-parent a { 
                 color: #2563eb !important; 
                 text-decoration: underline !important; 
              } 
              .pdf-export-parent hr {
                 border: none !important;
                 border-top: 2px dashed #94a3b8 !important;
                 margin: 40px 0 !important;
                 page-break-after: always !important;
              }
              .pdf-export-parent img {
                 max-width: 100% !important;
                 height: auto !important;
              }
              .pdf-export-parent .freestyle-wrapper {
                 transform-style: preserve-3d !important;
              }
              .pdf-export-parent .page-break-divider { 
                 page-break-after: always !important; 
                 page-break-inside: avoid !important; 
                 height: 0 !important; 
                 border: none !important; 
                 margin: 0 !important; 
                 padding: 0 !important; 
                 visibility: hidden !important; 
              }`;
            styleTag.innerHTML += `
              .pdf-export-parent a::after {
                 content: "" !important;
              }
              @media print {
                 .pdf-export-parent a::after {
                    content: "" !important;
                  }
                  a[href]::after {
                    content: "" !important;
                 }
              }
            `;
            parent.appendChild(styleTag);
            parent.style.position = 'fixed';
            parent.style.left = '0';
            parent.style.top = '0';
            parent.style.zIndex = '999999'; 
            parent.style.opacity = '0.01'; 
            parent.style.pointerEvents = 'none';
            parent.style.width = '800px';
            
            // Set margins based on rulers safely
            parent.style.paddingLeft = `${Math.min(180, Math.max(15, editorLeftMargin))}px`;
            parent.style.paddingRight = `${Math.min(180, Math.max(15, editorRightMargin))}px`;
            parent.style.paddingTop = `${Math.min(120, Math.max(15, editorVerticalMargin))}px`;
            parent.style.paddingBottom = `${Math.min(120, Math.max(15, editorVerticalMargin))}px`;
            parent.style.backgroundColor = '#ffffff';

            const clone = element.cloneNode(true) as HTMLElement;
            clone.removeAttribute('contenteditable');
            clone.classList.remove('prose-invert', 'dark:prose-invert', 'dark');
            clone.classList.add('prose', 'text-black', 'bg-white');
            clone.style.color = '#000000';
            clone.style.backgroundColor = '#ffffff';

            clone.querySelectorAll('*').forEach((el: any) => {
              el.classList.remove('text-white', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'prose-invert', 'dark:prose-invert');
              if (el.style) {
                if (el.style.color === 'white' || el.style.color === '#ffffff' || el.style.color === 'rgb(255, 255, 255)') {
                  el.style.color = '#000000';
                }
              }
            });

            // Post-process Freestyle Images/Watermarks for reliable position rendering
            try {
              clone.querySelectorAll('.freestyle-wrapper').forEach((wrapper: any) => {
                wrapper.style.width = '100%';
                wrapper.style.height = '100%';
                wrapper.style.position = 'absolute';
                wrapper.style.left = '0';
                wrapper.style.top = '0';
                wrapper.style.overflow = 'visible';
                wrapper.style.zIndex = '50';
                
                wrapper.querySelectorAll('img').forEach((img: any) => {
                   const xVal = img.getAttribute('x') || img.style.left || '150';
                   const yVal = img.getAttribute('y') || img.style.top || '150';
                   img.style.position = 'absolute';
                   img.style.left = `${parseFloat(xVal)}px`;
                   img.style.top = `${parseFloat(yVal)}px`;
                   img.style.width = img.getAttribute('width') ? `${img.getAttribute('width')}px` : '220px';
                   img.style.height = 'auto';
                   img.style.opacity = img.getAttribute('opacity') || img.style.opacity || '0.4';
                   img.style.zIndex = '50';
                });
              });
            } catch (errWatermark) {
              console.error("Failed aligning watermarks in PDF bundle:", errWatermark);
            }

            parent.appendChild(clone);
            document.body.appendChild(parent);

            await (html2pdf as any)().from(parent).set(opt).save();
            document.body.removeChild(parent);
       } catch (err) {
           console.error("PDF Export error:", err);
           setTimeout(() => window.print(), 500);
       } finally {
           removeWatermark();
           setSaving(false);
       }
       return;
    } else if (format === 'png' || format === 'jpg') {
        setSaving(true);
        try {
            const html2canvasModule = await import('html2canvas');
            const html2canvas = html2canvasModule.default ? html2canvasModule.default : html2canvasModule;
            
            addWatermark();
            const element = document.querySelector('.ProseMirror') as HTMLElement;
            if (element) {
                const parent = document.createElement('div');
                parent.className = 'light pdf-export-parent';
            const styleTag = document.createElement('style');
            styleTag.innerHTML = `.pdf-export-parent, .pdf-export-parent * { color: #000000 !important; background-color: transparent !important; text-shadow: none !important; box-shadow: none !important; } .pdf-export-parent h1, .pdf-export-parent h2, .pdf-export-parent h3, .pdf-export-parent h4, .pdf-export-parent p, .pdf-export-parent li, .pdf-export-parent span, .pdf-export-parent strong, .pdf-export-parent label, .pdf-export-parent div, .pdf-export-parent pre, .pdf-export-parent code { color: #111111 !important; } .pdf-export-parent table, .pdf-export-parent th, .pdf-export-parent td { border: 1px solid #cccccc !important; color: #111111 !important; background-color: #ffffff !important; } .pdf-export-parent a { color: #2563eb !important; text-decoration: underline !important; } .pdf-export-parent .page-break-divider { page-break-after: always !important; page-break-inside: avoid !important; height: 0 !important; border: none !important; margin: 0 !important; padding: 0 !important; visibility: hidden !important; }`;
            parent.appendChild(styleTag);
                parent.style.position = 'fixed';
                parent.style.left = '0';
                parent.style.top = '0';
                parent.style.zIndex = '999999'; parent.style.opacity = '0.01'; parent.style.pointerEvents = 'none';
                parent.style.width = '800px';
                parent.style.padding = '40px';
                parent.style.backgroundColor = '#ffffff';
                parent.style.color = '#000000';

                const clone = element.cloneNode(true) as HTMLElement;
                clone.removeAttribute('contenteditable');
                clone.classList.remove('prose-invert', 'dark:prose-invert', 'dark');
                clone.classList.add('prose', 'text-black', 'bg-white');
                clone.style.color = '#000000';
                clone.style.backgroundColor = '#ffffff';

                clone.querySelectorAll('*').forEach((el: any) => {
                  el.classList.remove('text-white', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'prose-invert', 'dark:prose-invert');
                  if (el.style) {
                    if (el.style.color === 'white' || el.style.color === '#ffffff' || el.style.color === 'rgb(255, 255, 255)') {
                      el.style.color = '#000000';
                    }
                  }
                });

                parent.appendChild(clone);
                document.body.appendChild(parent);

                const canvas = await (html2canvas as any)(parent, { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1200 });
                document.body.removeChild(parent);
                const imgData = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
                const a = document.createElement('a');
                a.href = imgData;
                a.download = `${filename}.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (e) {
            console.error(e);
            alert('Image export failed.');
        } finally {
            removeWatermark();
            setSaving(false);
        }
        return;
    } else if (format === 'zip') {
        const JSZipModule = await import('jszip');
        const zip = new JSZipModule.default();
        zip.file(`${filename}.md`, contentText);
        zip.file(`${filename}.html`, contentHtml);
        const content = await zip.generateAsync({ type: 'blob' });
        blob = content;
        filename += '.zip';
    }

    if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };

  // AI Prompt Handlers for Context Menu
  const handleAiAction = async (actionType: string, lang: string = 'Spanish') => {
    if (!editor) return;
    
    let isFullDocSelected = false;
    let targetHtml = '';
    
    const { empty, from, to } = editor.state.selection;
    
    if (empty) {
       targetHtml = editor.getHTML();
       isFullDocSelected = true;
    } else {
       // Serialize the selection to HTML to preserve headings and highlights
       const slice = editor.state.doc.slice(from, to);
       const serializer = DOMSerializer.fromSchema(editor.state.schema);
       const div = document.createElement('div');
       div.appendChild(serializer.serializeFragment(slice.content));
       targetHtml = div.innerHTML;
    }

    if (!targetHtml || targetHtml === '<p></p>') {
      alert("Document/Selection is empty.");
      setShowAiMenu(false);
      return;
    }
    
    setSaving(true);
    setIsProcessingAI(true);
    let prompt = "";
    
    const isHtml = true; // We always extract HTML now via DOMSerializer or getHTML()
    
    if (isHtml) {
      if (actionType === 'grammar') prompt = `Fix grammatical errors, spelling, and improve professional tone of the following document. You MUST preserve ALL HTML tags (like <h1>, <mark>, <p>). Only modify the text inside the tags. Respond strictly with exactly the revised HTML and no markdown wrappers:\n\n${targetHtml}`;
      if (actionType === 'translate') prompt = `Translate the text content of the following document to professional ${lang}. You MUST preserve ALL HTML tags (like <h1>, <mark>, <p>). Only translate the human-readable text inside the tags. Respond strictly with ONLY the translated HTML, no markdown wrappers:\n\n${targetHtml}`;
      if (actionType === 'summarize') prompt = `Provide a concise, professional summary of the following document. Use markdown bullet points or paragraphs. Respond strictly with ONLY the summary:\n\n${targetHtml}`;
      if (actionType === 'expand') prompt = `Elaborate on the following document, expanding its length by adding more detail. You MUST preserve ALL HTML tags (like <h1>, <mark>, <p>). Respond strictly with ONLY the new HTML:\n\n${targetHtml}`;
      if (actionType === 'tone-prof') prompt = `Rewrite the following document to sound extremely formal and professional. You MUST preserve ALL HTML tags (like <h1>, <mark>, <p>). Respond strictly with ONLY the new HTML:\n\n${targetHtml}`;
      if (actionType === 'extract-tasks') prompt = `Extract any action items, tasks, or to-dos from this document, and return them formatted as a markdown unordered list. Do NOT include extra conversation:\n\n${targetHtml}`;
      if (actionType === 'fact-check') prompt = `Identify any factual inaccuracies in the following document, and provide corrections. If it seems mostly correct, briefly state "Appears structurally correct". No conversational filler:\n\n${targetHtml}`;
      if (actionType === 'explain-5') prompt = `Explain the following document simply, as if to a 5-year-old child. Respond strictly with ONLY the new explanation text:\n\n${targetHtml}`;
      if (actionType === 'continue') prompt = `Act as an autocomplete AI. Read the following document, and write the very next logical sentence to continue the thought. Respond strictly with ONLY the new completion sentence:\n\n${targetHtml}`;
    }

    try {
      let result = "";
      if (useLocalModel && localEngine && !customApiKey) {
        const asyncChunkGenerator = await localEngine.chat.completions.create({
          messages: [
            { role: 'user', content: 'You are an advanced text processing AI. Follow the instructions strictly. Do not add greetings or wrap your answer in markdown code blocks. Preserve HTML tags perfectly when requested.\n\n' + prompt }
          ],
          stream: false,
          temperature: 0.3,
          max_tokens: 2048,
        });
        result = asyncChunkGenerator.choices[0]?.message?.content || "";
      } else {
        result = (await askGeminiProComplex(prompt, customApiKey)) || "";
      }

      if (result && (result.startsWith("Error:") || result.includes('"error":'))) {
        let displayError = result;
        try {
          const rawString = result.replace(/^Error:\s*/, '').trim();
          if (rawString.startsWith('{')) {
            const parsed = JSON.parse(rawString);
            if (parsed.error && parsed.error.message) {
              displayError = parsed.error.message;
            } else if (parsed.message) {
              displayError = parsed.message;
            }
          }
        } catch(e) {}
        throw new Error(displayError.replace(/^Error:\s*/, ""));
      }
      
      // Clean up any markdown code blocks returned by AI if they mistakenly added them
      result = result.replace(/^```(markdown|html|text)?\n/i, '').replace(/```$/g, '').trim();

      // Convert any markdown returned by AI to HTML safely (if it returned markdown instead of html)
      let parsedHtmlResult = result;
      // Only parse as markdown if it doesn't already contain our HTML tags, or just let marked handle it.
      // `marked` handles HTML blocks by passing them through.
      try {
         parsedHtmlResult = await marked.parse(result, { async: true });
      } catch (e) {
         parsedHtmlResult = result;
      }

      if (isFullDocSelected && ['grammar', 'translate', 'tone-prof', 'expand'].includes(actionType)) {
         // If we sent HTML, the result should ideally be HTML.
         // We set the whole content directly.
         editor.commands.setContent(result.includes('<p>') || result.includes('<h') ? result : parsedHtmlResult);
      } else {
         editor.chain().insertContent(isFullDocSelected ? `\n\n${parsedHtmlResult}` : parsedHtmlResult).run();
      }
    } catch(err: any) {
      alert("AI Error: " + err.message);
    } finally {
      setSaving(false);
      setIsProcessingAI(false);
      setShowAiMenu(false);
    }
  };

  const handleChatAction = async (actionType: string) => {
    if (!editor) return;
    const docContext = editor.getText() || "";
    if (!docContext) {
      alert("Document is empty.");
      setShowChatPlusMenu(false);
      return;
    }
    
    setLoadingMsg(true);
    setIsProcessingAI(true);
    setChatLog(p => [...p, {role:'user', content: `[Action executed: ${actionType}]`}]);
    
    let prompt = "";
    if (actionType === 'tables') prompt = `Convert the following document into a single valid Markdown table that logically organizes its data. If not tabular in nature, create a table summarizing key points. Respond strictly with ONLY the markdown table:\n\n${docContext}`;
    if (actionType === 'highlight-all') prompt = `Highlight the most important terms and concepts in the entire document by wrapping them in HTML <mark data-color="#FEF08A"> tags inside paragraphs. Return the ENTIRE document text with the marks added. Respond ONLY with the modified document, no extra conversation:\n\n${docContext}`;
    if (actionType === 'title') prompt = `Suggest a catchy, highly professional title for this document. Respond strictly with ONLY the title string, no quotes or additional text:\n\n${docContext}`;
    if (actionType === 'bullet-points') prompt = `Convert the core paragraphs of this document into a structured Markdown unordered list. Maintain all important details. Respond strictly with the list, no conversational filler:\n\n${docContext}`;
    if (actionType === 'semantic-color') prompt = `Format the following text by wrapping any positive/success-related actions in <span style="color: green">, and any warnings/issues in <span style="color: red">. Return the ENTIRE document text with the spans added. Respond ONLY with the modified document:\n\n${docContext}`;

    try {
      let result = "";
      if (useLocalModel && localEngine && !customApiKey) {
        setLoadingMsg(true);
        const asyncChunkGenerator = await localEngine.chat.completions.create({
          messages: [
            { role: 'user', content: 'You are a raw data parsing AI. You absolutely MUST NOT add greetings, conversational filler, or wrap your answer in markdown code blocks (` ``` `). Output exactly what is requested.\n\n' + prompt }
          ],
          stream: false,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 512,
          repetition_penalty: 1.1
        });
        result = asyncChunkGenerator.choices[0]?.message?.content || "";
      } else {
        result = (await askGeminiProComplex(prompt, customApiKey)) || "";
      }

      if (result && (result.startsWith("Error:") || result.includes('"error":'))) {
        let displayError = result;
        try {
          const rawString = result.replace(/^Error:\s*/, '').trim();
          if (rawString.startsWith('{')) {
            const parsed = JSON.parse(rawString);
            if (parsed.error && parsed.error.message) {
              displayError = parsed.error.message;
            } else if (parsed.message) {
              displayError = parsed.message;
            }
          }
        } catch(e) {}
        throw new Error(displayError.replace(/^Error:\s*/, ""));
      }

      result = result.replace(/^```(markdown|html|text)?\n/i, '').replace(/```$/g, '').trim();

      if (actionType === 'title') {
         setDocTitle(result);
         setChatLog(p => [...p, {role:'model', content: `Updated title to: "${result}"`}]);
      } else {
         let parsedHtmlResult = result;
         try {
            parsedHtmlResult = await marked.parse(result, { async: true });
         } catch (e) {
            parsedHtmlResult = result;
         }
         editor.commands.setContent(parsedHtmlResult);
         setChatLog(p => [...p, {role:'model', content: `Document successfully reformulated as requested.`}]);
      }
    } catch(err: any) {
      setChatLog(p => [...p, {role:'model', content: 'AI Error: ' + err.message}]);
    } finally {
      setLoadingMsg(false);
      setIsProcessingAI(false);
      setShowChatPlusMenu(false);
    }
  };

  // Quick Colors Matrix
  const PRESET_COLORS = [
    '#000000', '#4B5563', '#9CA3AF', '#D1D5DB', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
    '#10B981', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
  ];

  React.useEffect(() => {
    if (!showDrawModal || !drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Set up canvas background initially
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0,0, canvas.width, canvas.height);
  }, [showDrawModal]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Scale coordinates based on actual rendering size versus the canvas resolution (800x600 etc)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    ctx.beginPath();
    const { x, y } = getCanvasCoords(e);
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const insertDrawing = () => {
    if(!drawCanvasRef.current) return;
    const dataUrl = drawCanvasRef.current.toDataURL('image/png');
    editor?.chain().setImage({ src: dataUrl }).run();
    setShowDrawModal(false);
  };

  const getActiveLineHeight = () => {
    if (!editor) return '1.5';
    if (editor.isActive('paragraph')) return editor.getAttributes('paragraph').lineHeight;
    if (editor.isActive('heading')) return editor.getAttributes('heading').lineHeight;
    return '1.5';
  };
  const activeLineHeight = getActiveLineHeight();

  const handleLineHeight = (val: string) => {
    editor?.chain().setLineHeight(val).run();
  };

  return (
    <div className={`flex h-screen bg-dc-bg-page font-sans text-dc-text transition-all print:h-auto print:overflow-visible ${focusMode ? 'fixed inset-0 z-50 bg-[#EFEFEF]' : ''}`}>
      {!focusMode && <Sidebar defaultCollapsed={true} />}
      
      <div className="flex-1 flex flex-col relative w-full overflow-hidden print:overflow-visible print:h-auto">
        {useLocalModel && (
          <div className="flex-shrink-0 z-50">
             <LocalGemmaTerminal onEngineReady={setLocalEngine} isActive={useLocalModel} />
          </div>
        )}
        {!focusMode && (
        <header className="p-6 border-b border-dc-border flex justify-between items-center bg-white z-[30] shadow-sm relative shrink-0 print:hidden">
          <div className="flex flex-col">
             <input type="text" value={docTitle} onChange={(e) => handleTitleChange(e.target.value)} className="font-bold text-xl font-serif outline-none bg-transparent hover:bg-gray-50 px-2 py-1 rounded transition-colors" />
             <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 px-2 relative">
                
                {/* View Menu */}
                <div className="relative">
                  <span className="cursor-pointer hover:text-black py-1 font-medium transition-colors" onClick={() => { setShowViewMenu(!showViewMenu); setShowInsertMenu(false); setShowFormatMenu(false); }}>View</span>
                  {showViewMenu && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 shadow-xl rounded-xl py-1 z-[60] overflow-hidden">
                      <div className="px-4 py-2 text-[10px] uppercase text-gray-500 font-bold tracking-widest bg-gray-50/50">Interface settings</div>
                      <button onClick={() => setFocusMode(!focusMode)} className="w-full text-left px-4 py-2.5 hover:bg-dc-gold/10 hover:text-dc-gold transition-colors flex items-center justify-between text-sm font-medium">
                        Focus Mode <span className="text-xs text-gray-400 font-mono">⌘.</span>
                        {focusMode && <CheckCircle className="w-4 h-4 text-green-500"/>}
                      </button>
                      <button onClick={() => { setDragDropEditMode(!dragDropEditMode); setShowViewMenu(false); }} className="w-full text-left px-4 py-2.5 hover:bg-dc-gold/10 hover:text-dc-gold transition-colors flex items-center justify-between text-sm font-medium">
                         Text Drag & Drop {dragDropEditMode && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </button>
                      <div className="my-1 border-t border-gray-100"></div>
                      <div className="px-4 py-2 text-[10px] uppercase text-gray-500 font-bold tracking-widest bg-gray-50/50">Preview formatting</div>
                      {['pdf', 'html', 'txt', 'md'].map(fmt => (
                        <button key={fmt} onClick={() => { setSelectedFormat(fmt); setShowViewMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between capitalize text-sm text-gray-700">
                          {fmt.toUpperCase()} Mode {selectedFormat === fmt && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Insert Menu */}
                <div className="relative">
                  <span className="cursor-pointer hover:text-black py-1" onClick={() => { setShowInsertMenu(!showInsertMenu); setShowEditMenu(false); setShowViewMenu(false); setShowFormatMenu(false); }}>Insert</span>
                  {showInsertMenu && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 shadow-xl rounded-md py-2 z-50 px-2 space-y-2">
                       <div>
                         <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Insert Link</p>
                         <input type="text" placeholder="URL or /doc/ID" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="w-full text-xs p-1 border rounded mb-1" />
                         <input type="text" placeholder="Text to display..." value={linkText} onChange={e => setLinkText(e.target.value)} className="w-full text-xs p-1 border rounded mb-1" />
                         <button onClick={() => {
                           if(linkUrl) {
                              let normalized = linkUrl.trim();
                              if (!normalized.startsWith('http://') && !normalized.startsWith('https://') && !normalized.startsWith('mailto:') && !normalized.startsWith('tel:') && !normalized.startsWith('/') && !normalized.startsWith('#')) {
                                 normalized = 'https://' + normalized;
                              }
                              if(linkText) {
                                 editor?.chain().focus().insertContent(`<a href="${normalized}" target="_blank" rel="noopener noreferrer">${linkText}</a>`).run();
                              } else {
                                 editor?.chain().focus().setLink({ href: normalized }).run();
                              }
                           }
                           setShowInsertMenu(false);
                         }} className="w-full bg-blue-500 text-white text-xs py-1 rounded hover:bg-blue-600 transition-colors cursor-pointer">Add Link</button>
                       </div>
                       <div className="border-t my-1"></div>
                       <div>
                         <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Insert Image URL</p>
                         <input type="text" placeholder="Image URL..." onKeyDown={(e: any) => {
                           if (e.key === 'Enter') {
                             editor?.chain().setImage({ src: e.target.value }).run();
                             setShowInsertMenu(false);
                           }
                         }} className="w-full text-xs p-1 border rounded" />
                       </div>
                    </div>
                  )}
                </div>

                <span className="cursor-pointer hover:text-black py-1" onClick={() => { setShowFormatMenu(!showFormatMenu); setShowEditMenu(false); setShowViewMenu(false); setShowInsertMenu(false); }}>Format</span>
                {showFormatMenu && (
                  <div className="absolute top-full left-32 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50">
                      <div className="px-4 py-1 text-[10px] uppercase text-gray-400 font-bold tracking-wider">Valid Formats</div>
                      {['pdf', 'html', 'txt', 'md'].map(fmt => (
                        <button key={fmt} onClick={() => { setSelectedFormat(fmt); setShowFormatMenu(false); }} className="w-full text-left px-4 py-1.5 hover:bg-gray-100 flex items-center justify-between capitalize text-sm">
                          {fmt} {selectedFormat === fmt && <CheckCircle className="w-3 h-3 text-green-500"/>}
                        </button>
                      ))}
                  </div>
                )}

                <span className="text-gray-300 ml-2">|</span>
                <span className={`flex items-center gap-1.5 ${syncStatus === 'Saving...' ? 'text-amber-500' : 'text-dc-gold'} transition-colors ml-1`}>
                  {syncStatus === 'Saving...' ? <RefreshCw className="w-3 h-3 animate-spin"/> : <CheckCircle className="w-3 h-3"/>}
                  {syncStatus}
                </span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               title="Toggle WebLLM" 
               onClick={() => setUseLocalModel(!useLocalModel)} 
               className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-xs transition-all duration-300 relative overflow-hidden active:scale-98 ${
                 useLocalModel 
                   ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.35)] hover:shadow-[0_0_18px_rgba(16,185,129,0.5)]' 
                   : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
               }`}
             >
               <Layers className={`w-4 h-4 ${useLocalModel ? 'text-emerald-600' : ''}`} style={useLocalModel ? { animation: 'spin 12s linear infinite' } : undefined} /> 
               <span className="font-semibold">{useLocalModel ? 'Local AI Mode' : 'Cloud AI Mode'}</span>
               {useLocalModel && (
                 <span className="absolute inset-0 rounded-lg border border-emerald-400/30 animate-pulse pointer-events-none" />
               )}
             </button>
             
             <button
                onClick={async () => {
                   if (!id) return;
                   const newState = !isStarred;
                   setIsStarred(newState);
                   await updateDoc(doc(db, 'documents', id), { isStarred: newState });
                }}
                className={`p-2 rounded border transition-colors ${isStarred ? 'bg-yellow-50 border-yellow-200 text-yellow-500' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                title={isStarred ? 'Unstar Document' : 'Star Document'}
             >
                <Star className="w-4 h-4" fill={isStarred ? 'currentColor' : 'none'} />
             </button>

             <button
                onClick={async () => {
                   if (!id) return;
                   const newState = !isShared;
                   setIsShared(newState);
                   await updateDoc(doc(db, 'documents', id), { isShared: newState });
                   if (newState) {
                      const shareUrl = `${window.location.origin}/doc/${id}`;
                      if (navigator.share) {
                          navigator.share({
                            title: docTitle,
                            url: shareUrl
                          }).catch(console.error);
                      } else {
                          navigator.clipboard.writeText(shareUrl);
                          alert("Document is now public. Link copied to clipboard.");
                      }
                   }
                }}
                className={`p-2 rounded border transition-colors ${isShared ? 'bg-blue-50 border-blue-200 text-blue-500' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                title={isShared ? 'Make Private' : 'Share Document'}
             >
                <Share2 className="w-4 h-4" />
             </button>

             <div className="relative flex flex-col items-center z-[100]">
                {showApiKeySetting && (
                  <div className="absolute top-[120%] right-0 w-64 bg-white shadow-xl border border-gray-100 rounded-md p-3 z-[9999] animate-in fade-in">
                     <div className="text-[10px] text-gray-500 mb-1.5 font-bold uppercase tracking-wider">Custom API Key</div>
                     <input 
                        type="password"
                        placeholder="Paste your custom API key here"
                        value={customApiKey}
                        onChange={(e) => handleCustomKeyChange(e.target.value)}
                        autoComplete="off"
                        className="w-full text-xs border border-gray-300 rounded p-1.5 outline-none focus:border-blue-400 bg-gray-50/50"
                     />
                  </div>
                )}
                <div className="flex border border-blue-200 rounded-md shadow-sm divide-x divide-blue-200 bg-white">
                   <button onClick={handleEnhanceDoc} disabled={saving} className="flex-1 flex items-center px-3 py-1.5 hover:bg-blue-50 text-blue-700 text-sm font-medium transition-colors disabled:opacity-50">
                     <Sparkles className="w-4 h-4 mr-2" /> Enhance Doc
                   </button>
                   <button onClick={() => setShowApiKeySetting(!showApiKeySetting)} className="px-2 hover:bg-blue-50 text-blue-400 transition-colors flex items-center justify-center">
                     <Settings className="w-3.5 h-3.5" />
                   </button>
                </div>
             </div>

             <div className="relative flex flex-col items-center z-[100]">
                {showAutocompleteApiKeySetting && (
                  <div className="absolute top-[120%] right-0 w-64 bg-white shadow-xl border border-gray-100 rounded-md p-3 z-[9999] animate-in fade-in">
                     <div className="text-[10px] text-gray-500 mb-1.5 font-bold uppercase tracking-wider text-left w-full">Custom Autocomplete Key</div>
                     <input 
                        type="password"
                        placeholder="Paste your custom API key here"
                        value={customApiKey}
                        onChange={(e) => handleCustomKeyChange(e.target.value)}
                        autoComplete="off"
                        className="w-full text-xs border border-gray-300 rounded p-1.5 outline-none focus:border-purple-400 bg-gray-50/50 text-black"
                     />
                  </div>
                )}
                <div className="flex border border-purple-200 rounded-md shadow-sm divide-x divide-purple-200 bg-white items-center h-8">
                   <button onClick={handleAiAssist} disabled={saving} className="flex-1 flex items-center px-3 py-1 text-purple-700 text-xs font-medium transition-colors disabled:opacity-50 h-full hover:bg-purple-50">
                     <Wand2 className="w-3.5 h-3.5 mr-2 shrink-0" /> Autocomplete
                   </button>
                   <button onClick={() => setShowAutocompleteApiKeySetting(!showAutocompleteApiKeySetting)} className="px-2 hover:bg-purple-50 text-purple-400 transition-colors flex items-center justify-center h-full">
                     <Settings className="w-3.5 h-3.5" />
                   </button>
                </div>
             </div>
             
             <Button variant="outline" size="sm" onClick={() => setShowSyntaxSlider(true)} className="border-teal-200 hover:bg-teal-50 text-teal-700">
               <BarChart3 className="w-4 h-4 mr-2" /> Syntax Library
             </Button>

             <Button variant="outline" size="sm" onClick={() => setShowNotepad(true)} className="border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold">
               <Notebook className="w-4 h-4 mr-2" /> Note Pad
             </Button>

             <Button variant="outline" size="sm" onClick={() => { setWatermarkInitialImage(undefined); setShowWatermarkModal(true); }} className="border-indigo-200 hover:bg-indigo-50 text-indigo-700">
               <ImageIcon className="w-4 h-4 mr-2" /> Watermark Maker
             </Button>
             
             <div className="relative">
               <Button variant="outline" size="sm" onClick={() => setShowExportMenu(!showExportMenu)}>
                 <Download className="w-4 h-4 mr-2" /> Export
               </Button>
               {showExportMenu && (
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-1 z-[90]">
                   <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">Select Format</p>
                   <button onClick={() => { handleExport('pdf'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                     <Printer className="w-4 h-4" /> PDF Document
                   </button>
                   <button onClick={() => { handleExport('png'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                     <ImageIcon className="w-4 h-4" /> Image (.png)
                   </button>
                   <button onClick={() => { handleExport('jpg'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                     <ImageIcon className="w-4 h-4" /> Image (.jpg)
                   </button>
                   <button onClick={() => { handleExport('md'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                     <FileText className="w-4 h-4" /> Markdown (.md)
                   </button>
                   <button onClick={() => { handleExport('html'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                     <Code className="w-4 h-4" /> HTML (.html)
                   </button>
                   <button onClick={() => { handleExport('txt'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                     <FileText className="w-4 h-4" /> Plain Text (.txt)
                   </button>
                 </div>
               )}
             </div>

             <WatermarkModal 
               isOpen={showWatermarkModal} 
               onClose={() => setShowWatermarkModal(false)}
               editor={editor}
               initialImageSrc={watermarkInitialImage}
             />

             <Button onClick={async () => {
                 if (!id) return;
                 setSaving(true);
                 try {
                     const { saveDocOffline } = await import('../utils/idb');
                     await saveDocOffline({
                       id,
                       title: docTitle,
                       content: editor?.getHTML() || '',
                       savedOfflineAt: Date.now()
                     });
                     alert('Document saved to Archive!');
                 } catch (err) {
                     console.error("Failed to archive:", err);
                 } finally {
                     setSaving(false);
                 }
             }} variant="gold" size="sm" className="shadow-md">
               <Save className="w-4 h-4 mr-2" /> Save
             </Button>
          </div>
        </header>
        )}

        {/* Toolbar */}
        {!focusMode && (
        <div 
          className="border-b border-dc-border bg-[#FAFAFA] p-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-1 shrink-0 shadow-sm z-[20] relative print:hidden"
          onMouseDown={(e) => {
             // Prevent toolbar clicks from stealing editor focus, unless it's an input
             if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'SELECT') {
               e.preventDefault();
             }
          }}
        >
            
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
              <button title="Undo" onClick={() => editor?.chain().undo().run()} disabled={!editor?.can().undo()} className="p-2 flex-shrink-0 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30">
                <Undo className="w-4 h-4" />
              </button>
              <button title="Redo" onClick={() => editor?.chain().redo().run()} disabled={!editor?.can().redo()} className="p-2 flex-shrink-0 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30">
                <Redo className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1 relative">
              <button 
                title="Font Family" 
                onClick={() => { setShowFontMenu(!showFontMenu); setShowSizeMenu(false); setShowColorPicker(false); setShowHighlightPicker(false); setShowAiMenu(false); }}
                className="text-sm bg-transparent border border-transparent hover:bg-gray-200 outline-none cursor-pointer rounded px-2 py-1.5 mx-1 text-gray-700 font-medium w-28 truncate text-left"
              >
                  {editor?.getAttributes('textStyle').fontFamily || 'DM Sans'}
              </button>
              
              {showFontMenu && (
                 <div className="absolute top-10 left-1 bg-white border border-gray-200 shadow-xl rounded-xl w-60 z-[70] backdrop-blur-md bg-white/95 overflow-y-auto max-h-[400px] flex flex-col py-1">
                    {[
                      'inherit', 'Inter', 'Merriweather', 'JetBrains Mono', 'Playfair Display', 
                      'Zeyada', 'Syncopate', 'Bungee', 'Abril Fatface', 'Bebas Neue', 'Cinzel Decorative',
                      'Fira Code', 'Ubuntu', 'Pacifico', 'Poppins', 'Roboto Slab', 
                      'Great Vibes', 'Cormorant Garamond', 'Anton', 'IBM Plex Sans', 
                      'Indie Flower', 'Montserrat', 'Crimson Pro', 'Dancing Script', 
                      'Space Grotesk', 'Libre Baskerville', 'Caveat', 'Lobster', 'Sacramento', 
                      'Yellowtail', 'Amatic SC', 'Righteous', 'Permanent Marker', 'Cinzel', 'Satisfy',
                      'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Garamond', 'Courier New', 'Verdana'
                    ].map(f => (
                       <button 
                         key={f} 
                         onClick={() => { editor?.chain().setFontFamily(f === 'inherit' ? 'DM Sans' : f).run(); setShowFontMenu(false); }}
                         className="px-4 py-2 text-sm text-left hover:bg-gray-100 font-medium whitespace-nowrap"
                         style={{ fontFamily: f === 'inherit' ? 'DM Sans' : f }}
                       >
                         {f === 'inherit' ? 'DM Sans' : f}
                       </button>
                    ))}
                 </div>
              )}
              
              <div className="relative">
                 <button 
                   title="Font Size" 
                   onClick={() => { setShowSizeMenu(!showSizeMenu); setShowFontMenu(false); setShowColorPicker(false); setShowHighlightPicker(false); setShowAiMenu(false); }}
                   className="text-sm bg-transparent border border-transparent hover:bg-gray-200 outline-none cursor-pointer rounded px-2 py-1.5 mx-1 text-gray-700 font-medium w-12 text-center"
                 >
                    {editor?.getAttributes('textStyle').fontSize?.replace('px', '') || '16'}
                 </button>

                 {showSizeMenu && (
                   <div className="absolute top-10 left-1 bg-white border border-gray-200 shadow-xl rounded-xl w-16 z-[70] backdrop-blur-md bg-white/95 overflow-y-auto max-h-64 flex flex-col py-1">
                      {['8', '10', '12', '14', '16', '18', '20', '24', '28', '32'].map(s => (
                         <button 
                           key={s} 
                           onClick={() => { editor?.chain().setFontSize(`${s}px`).run(); setShowSizeMenu(false); }}
                           className="px-2 py-1.5 text-sm w-full text-center hover:bg-gray-100 font-medium"
                         >
                           {s}
                         </button>
                      ))}
                   </div>
                 )}
              </div>

              <div className="relative">
                 <button 
                   title="Text Styles" 
                   onClick={() => { setShowHeadingMenu(!showHeadingMenu); setShowSizeMenu(false); setShowFontMenu(false); setShowColorPicker(false); setShowHighlightPicker(false); setShowAiMenu(false); }}
                   className="text-sm bg-transparent border border-transparent hover:bg-gray-200 outline-none cursor-pointer rounded px-2 py-1.5 mx-1 text-gray-700 font-medium w-28 truncate text-left"
                 >
                    {editor?.isActive('heading', { level: 1 }) ? 'H1 Title' :
                     editor?.isActive('heading', { level: 2 }) ? 'H2 Heading' :
                     editor?.isActive('heading', { level: 3 }) ? 'H3 Subtitle' :
                     editor?.isActive('heading', { level: 4 }) ? 'H4 Subheading' :
                     editor?.isActive('heading', { level: 5 }) ? 'H5 Component' :
                     editor?.isActive('heading', { level: 6 }) ? 'H6 Code Title' : 'Normal Text'}
                 </button>

                 {showHeadingMenu && (
                   <div className="absolute top-10 left-1 bg-white border border-gray-200 shadow-xl rounded-xl w-48 z-[70] backdrop-blur-md bg-white/95 overflow-hidden flex flex-col py-1">
                      {[
                        { label: 'Normal Text', val: 0, class: 'text-sm' },
                        { label: 'H1 Title', val: 1, class: 'text-2xl font-black uppercase tracking-tight' },
                        { label: 'H2 Heading', val: 2, class: 'text-xl font-bold' },
                        { label: 'H3 Subtitle', val: 3, class: 'text-lg font-semibold' },
                        { label: 'H4 Subheading', val: 4, class: 'text-base font-medium' },
                        { label: 'H5 Component', val: 5, class: 'text-[15px] font-medium tracking-wide uppercase text-gray-600' },
                        { label: 'H6 Code Title', val: 6, class: 'text-sm font-mono text-gray-500' }
                      ].map(h => (
                         <button 
                           key={h.label} 
                           onClick={() => { 
                              if (h.val === 0) editor?.chain().setParagraph().run();
                              else editor?.chain().toggleHeading({ level: h.val as any }).run();
                              setShowHeadingMenu(false); 
                           }}
                           className={`px-4 py-2 text-left hover:bg-gray-100 ${h.class}`}
                         >
                           {h.label}
                         </button>
                      ))}
                   </div>
                 )}
              </div>
            </div>

            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
              <button title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <Bold className="w-4 h-4" />
              </button>
              <button title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <Italic className="w-4 h-4" />
              </button>
              <button title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('underline') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <button title="Strikethrough" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleStrike().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('strike') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <Strikethrough className="w-4 h-4" />
              </button>
              <button title="Subscript" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleSubscript().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('subscript') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <SubIcon className="w-4 h-4" />
              </button>
              <button title="Superscript" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleSuperscript().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('superscript') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <SuperIcon className="w-4 h-4" />
              </button>
              <button title="Clear Formatting" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()} className="p-1.5 flex-shrink-0 rounded hover:bg-gray-200 text-gray-600">
                <Eraser className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1 relative">
              <button 
                title="Text Color" 
                onClick={() => { setShowColorPicker(!showColorPicker); setTempColor(editor?.getAttributes('textStyle').color || '#000000'); setShowHighlightPicker(false); setShowAiMenu(false); setShowFontMenu(false); setShowSizeMenu(false); setShowStrokeMenu(false); }} 
                className="p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors flex items-center justify-center relative"
              >
                <div className="w-5 h-5 flex flex-col items-center justify-between font-serif font-bold pt-0.5">
                   <span className="leading-none" style={{ color: editor?.getAttributes('textStyle').color || '#000000' }}>A</span>
                   <div className="w-3.5 h-1 mt-0.5" style={{ backgroundColor: editor?.getAttributes('textStyle').color || '#000000' }}></div>
                </div>
              </button>

              {/* Color Popup */}
              {showColorPicker && (
                <div onMouseDown={(e) => e.preventDefault()} className="absolute top-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-xl p-4 w-64 z-[70] backdrop-blur-md bg-white/95">
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Custom Spectrum</p>
                  <div className="mb-3">
                     <HexColorPicker 
                       color={tempColor}
                       onChange={setTempColor}
                     />
                  </div>
                  <button onClick={() => { editor?.chain().setColor(tempColor).run(); setShowColorPicker(false); }} className="w-full bg-blue-600 text-white font-bold py-1.5 rounded-md mb-3 hover:bg-blue-700 transition">Apply Color</button>
                  
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Quick Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(c => (
                      <button 
                        key={c} 
                        className="w-5 h-5 rounded-md hover:scale-110 active:scale-95 transition-transform border border-gray-100 shadow-sm" 
                        style={{ backgroundColor: c }}
                        onClick={() => { editor?.chain().setColor(c).run(); setShowColorPicker(false); }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                    <button onClick={() => { editor?.chain().unsetColor().run(); setShowColorPicker(false); }} className="text-sm text-gray-500 hover:text-black">Reset color</button>
                  </div>
                </div>
              )}

              <button 
                title="Highlight" 
                onClick={() => { setShowHighlightPicker(!showHighlightPicker); setTempHighlightColor(editor?.getAttributes('highlight').color || '#FEF08A'); setShowColorPicker(false); setShowAiMenu(false); setShowFontMenu(false); setShowSizeMenu(false); setShowStrokeMenu(false); }} 
                className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('highlight') ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600'}`}
              >
                <Highlighter className="w-4 h-4" />
              </button>

              {/* Stroke Button */}
              <button 
                title="Text Stroke / Outline" 
                onClick={() => { setShowStrokeMenu(!showStrokeMenu); setTempStrokeColor(editor?.getAttributes('textStyle').strokeColor || '#000000'); setShowHighlightPicker(false); setShowColorPicker(false); setShowFontMenu(false); setShowSizeMenu(false); setShowAiMenu(false); }} 
                className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.getAttributes('textStyle').strokeWidth ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
              >
                <PenTool className="w-4 h-4" />
              </button>

              {/* Stroke Popup */}
              {showStrokeMenu && (
                <div onMouseDown={(e) => e.preventDefault()} className="absolute top-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-xl p-4 w-64 z-[70] backdrop-blur-md bg-white/95">
                  <div className="flex flex-col mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stroke Width: {editor?.getAttributes('textStyle').strokeWidth || '1px'}</p>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={parseInt(editor?.getAttributes('textStyle').strokeWidth || '1')} 
                      onChange={(e) => {
                         const val = `${e.target.value}px`;
                         editor?.chain().setStrokeWidth(val).run(); 
                      }}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Stroke Color</p>
                  <div className="mb-3">
                     <HexColorPicker 
                       color={tempStrokeColor}
                       onChange={setTempStrokeColor}
                     />
                  </div>
                  <button onClick={() => { 
                      editor?.chain().setStrokeColor(tempStrokeColor).run();
                      if (!editor?.getAttributes('textStyle').strokeWidth) {
                          editor?.chain().setStrokeWidth('1px').run();
                      }
                      setShowStrokeMenu(false); 
                  }} className="w-full bg-blue-600 text-white font-bold py-1.5 rounded-md mb-2 hover:bg-blue-700 transition">Apply Stroke</button>
                  <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2">
                    <button onClick={() => { editor?.chain().unsetStroke().run(); setShowStrokeMenu(false); }} className="text-sm text-gray-500 hover:text-black">Reset stroke</button>
                    <button onClick={() => setShowStrokeMenu(false)} className="text-sm font-bold text-blue-600">Done</button>
                  </div>
                </div>
              )}
              
              {/* Highlight Popup */}
              {showHighlightPicker && (
                <div onMouseDown={(e) => e.preventDefault()} className="absolute top-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-xl p-4 w-64 z-[70] backdrop-blur-md bg-white/95">
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Custom Spectrum</p>
                  <div className="mb-3">
                     <HexColorPicker 
                       color={tempHighlightColor}
                       onChange={setTempHighlightColor}
                     />
                  </div>
                  <button onClick={() => { editor?.chain().setHighlight({ color: tempHighlightColor }).run(); setShowHighlightPicker(false); }} className="w-full bg-blue-600 text-white font-bold py-1.5 rounded-md mb-3 hover:bg-blue-700 transition">Apply Highlight</button>
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Quick Colors</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                     {['#FEF08A', '#BBF7D0', '#BFDBFE', '#FBCFE8', '#E5E7EB', '#FDBA74'].map(c => (
                       <button 
                          key={c}
                          className="w-6 h-6 rounded-md hover:scale-110 shadow-sm border border-black/5"
                          style={{ backgroundColor: c }}
                          onClick={() => { editor?.chain().setHighlight({ color: c }).run(); setShowHighlightPicker(false); }}
                       />
                     ))}
                  </div>
                  <div className="pt-2 border-t border-gray-100 text-center">
                     <button onClick={() => { editor?.chain().unsetHighlight().run(); setShowHighlightPicker(false); }} className="text-sm text-gray-500 hover:text-black">Remove Highlight</button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
              <button title="Align Left" onClick={() => editor?.chain().setTextAlign('left').run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <AlignLeft className="w-4 h-4" />
              </button>
              <button title="Align Center" onClick={() => editor?.chain().setTextAlign('center').run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <AlignCenter className="w-4 h-4" />
              </button>
              <button title="Align Right" onClick={() => editor?.chain().setTextAlign('right').run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
              <button title="Single Spacing" onClick={() => handleLineHeight('1.0')} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${activeLineHeight === '1.0' ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <div className="flex flex-col gap-[2px] items-center"><div className="w-4 h-[2px] bg-current rounded-full"/><div className="w-4 h-[2px] bg-current rounded-full"/><div className="w-4 h-[2px] bg-current rounded-full"/></div>
              </button>
              <button title="Tight Spacing" onClick={() => handleLineHeight('1.15')} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${activeLineHeight === '1.15' ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                 <div className="flex flex-col gap-[3px] items-center"><div className="w-4 h-[2px] bg-current rounded-full"/><div className="w-4 h-[2px] bg-current rounded-full"/><div className="w-4 h-[2px] bg-current rounded-full"/></div>
              </button>
              <button title="Normal Spacing" onClick={() => handleLineHeight('1.5')} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${activeLineHeight === '1.5' ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                 <div className="flex flex-col gap-1 items-center"><div className="w-4 h-[2px] bg-current rounded-full"/><div className="w-4 h-[2px] bg-current rounded-full"/><div className="w-4 h-[2px] bg-current rounded-full"/></div>
              </button>
              <button title="Double Spacing" onClick={() => handleLineHeight('2.0')} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${activeLineHeight === '2.0' ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                 <div className="flex flex-col gap-[5px] items-center"><div className="w-4 h-[2px] bg-current rounded-full"/><div className="w-4 h-[2px] bg-current rounded-full"/><div className="w-4 h-[2px] bg-current rounded-full"/></div>
              </button>
            </div>

            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
              <button title="Bullet List" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <List className="w-4 h-4" />
              </button>
              <button title="Numbered List" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <ListOrdered className="w-4 h-4" />
              </button>
              <button title="Task List" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleTaskList().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('taskList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <CheckSquare className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
              <button title="Blockquote" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('blockquote') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <Quote className="w-4 h-4" />
              </button>
              <button title="Code Block" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('codeBlock') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <Code className="w-4 h-4" />
              </button>
              <button title="Insert Redirect Link (URL)" onClick={addLink} className={`p-1.5 flex-shrink-0 rounded hover:bg-rose-50 hover:text-red-600 transition-colors ${editor?.isActive('link') ? 'bg-rose-100 text-red-600' : 'text-slate-600'}`}>
                <LinkIcon className="w-4 h-4" />
              </button>
              <button title="Attach File (Embed inside document & PDF)" onClick={() => {
                 const input = document.createElement('input');
                 input.type = 'file';
                 input.onchange = async (e) => {
                   const file = (e.target as HTMLInputElement).files?.[0];
                   if (file) {
                     if (!editor) return;
                     if (file.size > 500 * 1024) {
                       alert('File is too large to embed natively. Please select a file under 500KB to ensure your document saves correctly.');
                       return;
                     }
                     const reader = new FileReader();
                     reader.onload = (event) => {
                        const base64Data = event.target?.result;
                        if (typeof base64Data === 'string') {
                           setAttachedFile(file);
                           setAttachedFileBase64(base64Data);
                           setAttachedFileText(file.name);
                           setShowFileModal(true);
                        }
                     };
                     reader.readAsDataURL(file);
                   }
                 };
                 input.click();
              }} className="p-1.5 flex-shrink-0 rounded hover:bg-rose-50 text-slate-600 hover:text-red-600 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              
              <button 
                title="Embed Clickable Photo (Opens as pop-up on screen)" 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      if (!editor) return;
                      if (file.size > 800 * 1024) {
                        alert('Image file size is too large to embed natively. Please select an image under 800KB.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                         const base64Data = event.target?.result;
                         if (typeof base64Data === 'string') {
                            setAttachedPhotoFile(file);
                            setAttachedPhotoBase64(base64Data);
                            setAttachedPhotoText('View Photo');
                            setShowPhotoModal(true);
                         }
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }} 
                className="p-1.5 flex-shrink-0 rounded hover:bg-rose-50 text-slate-600 hover:text-red-600 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-pink-500 hover:scale-110 active:scale-95 transition-transform" />
              </button>
              <button title="Horizontal Rule" onClick={() => editor?.chain().setHorizontalRule().run()} className="p-1.5 flex-shrink-0 rounded hover:bg-gray-200 text-gray-600">
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="relative flex items-center">
                 <button 
                   title="Insert Symbol" 
                   onClick={() => setShowSymbolMenu(!showSymbolMenu)} 
                   className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${showSymbolMenu ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                 >
                   <Sigma className="w-4 h-4" />
                 </button>
                 {showSymbolMenu && (
                   <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-xl w-80 z-[100] backdrop-blur-md bg-white/95 p-3 flex flex-wrap gap-2 max-h-62 overflow-y-auto animate-in fade-in zoom-in-95">
                      {['>','[','{','=','\\','°','€','√','|','•','~','`','£','¢','©','®','™','✓','✗','★','☆','♡','♥','♪','♫','∞','∑','π','Ω','µ','∂','∆','§','¶','†','‡','♣','♦','♠','←','↑','→','↓','↔','↕','≈','≠','≤','≥','±','÷','×','½','¼','¾','©','®','™','°','℃','℉', 'α', 'β', 'γ', 'δ', 'θ', 'λ', 'μ', '∇', '∫', '∬', '∮', '∛', '∜', '‰', 'ℏ', '♀', '♂', '✦', '✧', '❄', '⚙', '⚓', '⚔', '⚖', '⚗', '✈', '✉', '⌘', '⌥', '⇧', '⌃', '⏎', '✍', '✂', '✿', '❀', '☣', '☢', '☠', '⚠', '⚡', '№', '℠', '℗', '℔', '℁', '℅', '℆', '元', '¥', '₹', '₽', '₩', '฿', '₫', '⊕', '⊗', '⊘', '⊙', '⊞', '⊟', '⊠', '⊡', '⇅', '⇄', '⇉', '⇇', '⇈', '⇊', '⇚', '⇛', '↻', '↺', '▪', '▫', '▲', '▼', '◆', '◇', '◊', '□', '■', '●', '○', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'].map(sym => (
                         <button
                           key={sym}
                           title={`Insert ${sym}`}
                           onClick={() => {
                              editor?.chain().insertContent(sym).run();
                              setShowSymbolMenu(false);
                           }}
                           className="w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-dc-gold/10 hover:text-dc-gold transition-colors border border-transparent hover:border-dc-gold/20 font-medium"
                         >
                           {sym}
                         </button>
                      ))}
                   </div>
                 )}
              </div>
            </div>

            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
              <button title="Draw Image Canvas" onClick={() => setShowDrawModal(true)} className="p-1.5 flex-shrink-0 rounded hover:bg-gray-200 text-gray-600">
                <PenTool className="w-4 h-4" />
              </button>
              
              <div className="relative">
                <button title="AI Editor Actions" onClick={() => { setShowAiMenu(!showAiMenu); setShowColorPicker(false); setShowHighlightPicker(false); setShowFontMenu(false); setShowSizeMenu(false); setShowHeadingMenu(false); }} className="p-1.5 flex-shrink-0 rounded hover:bg-purple-100 hover:text-purple-600 text-gray-600 transition-colors flex items-center justify-center">
                   <Sparkles className="w-4 h-4" />
                   <span className="text-xs font-bold ml-1">AI</span>
                </button>

                {showAiMenu && (
                  <div onMouseDown={(e) => e.preventDefault()} className="absolute top-10 right-0 bg-white border border-gray-200 shadow-2xl rounded-xl w-[450px] z-[70] backdrop-blur-md bg-white/95 overflow-hidden flex flex-col p-4">
                     <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">AI Magic Tools</p>
                     
                     <div className="grid grid-cols-2 gap-2">
                       {/* Column 1 */}
                       <div className="flex flex-col gap-1">
                         <button onClick={() => handleAiAction('grammar')} className="flex items-center px-3 py-2.5 rounded hover:bg-gray-100 text-sm text-left transition-colors">
                            <Sparkles className="w-4 h-4 mr-3 text-dc-gold" />
                            <div><p className="font-medium text-gray-900 leading-tight">Grammar Fix</p><p className="text-[10px] text-gray-500">Corrects spelling & flow</p></div>
                         </button>
                         <div className="flex items-center justify-between px-3 py-2.5 rounded hover:bg-gray-100 transition-colors mx-0">
                           <button onClick={() => handleAiAction('translate', selectedLang)} className="flex items-center text-sm text-left flex-1" title="Translate Selection">
                              <Languages className="w-4 h-4 mr-3 text-green-500" />
                              <div><p className="font-medium text-gray-900 leading-tight">Translate</p><p className="text-[10px] text-gray-500">Selection to chosen language</p></div>
                           </button>
                           <select 
                             value={selectedLang} 
                             onMouseDown={(e) => e.stopPropagation()}
                             onChange={(e) => setSelectedLang(e.target.value)} 
                             className="text-[10px] ml-1 bg-white border border-gray-200 rounded p-1 text-gray-700 outline-none w-20"
                           >
                             {['Arabic', 'Bengali', 'Bulgarian', 'Chinese', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Estonian', 'Finnish', 'French', 'German', 'Greek', 'Hebrew', 'Hindi', 'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Latvian', 'Lithuanian', 'Malay', 'Norwegian', 'Persian', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Slovak', 'Slovenian', 'Spanish', 'Swahili', 'Swedish', 'Tagalog', 'Thai', 'Turkish', 'Ukrainian', 'Urdu', 'Vietnamese'].sort().map(l => (
                               <option key={l} value={l}>{l}</option>
                             ))}
                           </select>
                         </div>
                         <button onClick={() => handleAiAction('summarize')} className="flex items-center px-3 py-2.5 rounded hover:bg-gray-100 text-sm text-left transition-colors">
                            <FileText className="w-4 h-4 mr-3 text-purple-500" />
                            <div><p className="font-medium text-gray-900 leading-tight">Summarize</p><p className="text-[10px] text-gray-500">Condense into key points</p></div>
                         </button>
                         <button onClick={() => handleAiAction('expand')} className="flex items-center px-3 py-2.5 rounded hover:bg-gray-100 text-sm text-left transition-colors">
                            <Layers className="w-4 h-4 mr-3 text-orange-500" />
                            <div><p className="font-medium text-gray-900 leading-tight">Elaborate</p><p className="text-[10px] text-gray-500">Expand text length</p></div>
                         </button>
                       </div>
                       
                       {/* Column 2 */}
                       <div className="flex flex-col gap-1">
                         <button onClick={() => handleAiAction('tone-prof')} className="flex items-center px-3 py-2.5 rounded hover:bg-gray-100 text-sm text-left transition-colors">
                            <Briefcase className="w-4 h-4 mr-3 text-indigo-500" />
                            <div><p className="font-medium text-gray-900 leading-tight">Professionalize</p><p className="text-[10px] text-gray-500">Shift to formal tone</p></div>
                         </button>
                         <button onClick={() => handleAiAction('extract-tasks')} className="flex items-center px-3 py-2.5 rounded hover:bg-gray-100 text-sm text-left transition-colors">
                            <CheckCircle className="w-4 h-4 mr-3 text-teal-500" />
                            <div><p className="font-medium text-gray-900 leading-tight">Extract Tasks</p><p className="text-[10px] text-gray-500">Find action items</p></div>
                         </button>
                         <button onClick={() => handleAiAction('fact-check')} className="flex items-center px-3 py-2.5 rounded hover:bg-gray-100 text-sm text-left transition-colors">
                            <Search className="w-4 h-4 mr-3 text-red-500" />
                            <div><p className="font-medium text-gray-900 leading-tight">Fact Check</p><p className="text-[10px] text-gray-500">Verify statements</p></div>
                         </button>
                         <button onClick={() => handleAiAction('explain-5')} className="flex items-center px-3 py-2.5 rounded hover:bg-gray-100 text-sm text-left transition-colors">
                            <Type className="w-4 h-4 mr-3 text-pink-500" />
                            <div><p className="font-medium text-gray-900 leading-tight">Simplify</p><p className="text-[10px] text-gray-500">Explain like I am 5</p></div>
                         </button>
                         <button onClick={() => handleAiAction('continue')} className="flex items-center px-3 py-2.5 rounded hover:bg-gray-100 text-sm text-left transition-colors border border-green-200 bg-green-50/50">
                            <Wand2 className="w-4 h-4 mr-3 text-blue-500" />
                            <div><p className="font-medium text-gray-900 leading-tight">Auto-Complete</p><p className="text-[10px] text-gray-500">Write the next sentence</p></div>
                         </button>
                       </div>
                     </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button title="Elements" onClick={() => { setShowElementPanel(!showElementPanel); setShowAiMenu(false); setShowColorPicker(false); setShowHighlightPicker(false); }} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${showElementPanel ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                  <LayoutList className="w-4 h-4 text-blue-500" />
                </button>
                
                {showElementPanel && (
                  <div className="absolute top-10 right-0 bg-white border border-gray-200 shadow-2xl rounded-xl w-[360px] max-h-[500px] z-[80] overflow-y-auto overflow-x-hidden flex flex-col pt-3 pb-2 flex scroll-smooth">
                     <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider px-4 shrink-0">Structural Elements</p>
                     <div className="grid grid-cols-2 gap-3 px-4 py-2 shrink-0">
                        <button 
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 shadow-sm hover:border-dc-gold hover:bg-yellow-50 transition-all text-left"
                          onClick={() => {
                             setShowElementPanel(false);
                             navigate(`/doc/${id}/charts`);
                          }}
                        >
                          <BarChart3 className="w-6 h-6 text-emerald-500 shrink-0" />
                          <div>
                            <span className="text-[12px] font-bold block">Charts Library</span>
                            <span className="text-[10px] text-gray-400">Interactive D3/Recharts</span>
                          </div>
                        </button>
                        
                        <button 
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 shadow-sm hover:border-dc-gold hover:bg-yellow-50 transition-all text-left relative overflow-hidden"
                        >
                          <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                     const dataUrl = event.target?.result as string;
                                     editor?.chain().focus().insertContent({ type: 'image', attrs: { src: dataUrl, align: 'center', width: '300px' } }).run();
                                  };
                                  reader.readAsDataURL(file);
                               }
                               setShowElementPanel(false);
                            }}
                          />
                          <svg className="w-6 h-6 text-blue-500 shrink-0 relative z-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <div className="relative z-0 pointer-events-none">
                            <span className="text-[12px] font-bold block">Gallery Image</span>
                            <span className="text-[10px] text-gray-400">Upload from device</span>
                          </div>
                        </button>
                     </div>
                     
                     <div className="h-px bg-gray-100 mx-4 my-2 shrink-0"></div>
                     <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider px-4 shrink-0">Vector Studio</p>
                     <div className="px-4 pb-2">
                        <button 
                          onClick={() => {
                             setShowElementPanel(false);
                             navigate(`/doc/${id}/studio`);
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-3 text-sm font-bold shadow-md hover:scale-[1.02] transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          Create Custom Element
                        </button>
                     </div>

                     <div className="h-px bg-gray-100 mx-4 my-2 shrink-0"></div>
                     <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider px-4 shrink-0">Decorative Library</p>
                     
                     <div className="px-4 pb-4">
                       <div className="grid grid-cols-2 gap-3">
                         {DECORATIVE_ELEMENTS.map((el, i) => (
                           <button 
                             key={i}
                             className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 shadow-sm hover:border-dc-gold hover:bg-yellow-50 transition-all"
                             onClick={() => {
                               editor?.chain().insertContent({ type: 'image', attrs: { src: el.src, align: 'center', width: el.defaultWidth } }).run();
                               setShowElementPanel(false);
                             }}
                             title={`Insert ${el.name}`}
                           >
                             <div className="h-10 flex items-center justify-center w-full">
                               <img src={el.src} className="max-h-full max-w-full" alt={el.name} />
                             </div>
                             <span className="text-[10px] font-medium text-gray-600 truncate w-full text-center">{el.name}</span>
                           </button>
                         ))}
                       </div>
                     </div>
                  </div>
                )}
              </div>

            </div>

            <div className="flex items-center gap-1">
              <button 
                title="AI Datasheets" 
                onClick={() => navigate('/ai-sheets')} 
                className="p-1.5 flex-shrink-0 rounded hover:bg-purple-100 text-purple-600 hover:scale-110 transition-all ml-1"
              >
                <FileSpreadsheet className="w-5 h-5" />
              </button>
              <button 
                title="Frame/Panel" 
                onClick={() => navigate(`/doc/${id}/frames`)} 
                className="p-1.5 flex-shrink-0 rounded hover:bg-gray-200 text-gray-600 hover:scale-110 transition-all ml-1"
              >
                <Layout className="w-5 h-5" />
              </button>
              <div className="relative">
                <button 
                  title="Docs Theme Canvas" 
                  onClick={() => setShowThemeDropdown(!showThemeDropdown)} 
                  className={`p-1.5 flex-shrink-0 rounded hover:scale-110 transition-all ml-1 ${showThemeDropdown ? 'bg-gray-200 text-black' : 'hover:bg-gray-200 text-gray-600'}`}
                >
                  <Palette className="w-5 h-5" />
                </button>
                {showThemeDropdown && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 shadow-xl rounded-xl w-64 z-[99999] backdrop-blur-md bg-white/95 p-3 animate-in fade-in zoom-in-95">
                    <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Document Theme Canvas</p>
                    <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
                      {Object.entries(DOCUMENT_THEMES).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setDocThemeKey(key);
                            localStorage.setItem('doc_theme_key', key);
                            setShowThemeDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs font-semibold hover:bg-gray-100 transition-colors ${docThemeKey === key ? 'bg-blue-50 text-blue-600' : 'text-gray-750'}`}
                        >
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-4 h-4 rounded-full border border-gray-300 shadow-sm shrink-0" 
                              style={{ backgroundColor: value.bgValue }} 
                            />
                            <span>{value.name}</span>
                          </div>
                          {docThemeKey === key && (
                            <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
        )}

        <div 
          className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 flex justify-center items-start gap-8 relative print:bg-white print:p-0 print:overflow-visible transition-all duration-300"
          style={{ backgroundColor: DOCUMENT_THEMES[docThemeKey]?.outerBgValue || '#EFEFEF' }}
        >
          <div 
             className={cn(
               "flex-1 w-full py-16 md:py-24 shadow-xl border h-fit transition-all duration-300 mb-20 relative outline-none print:shadow-none print:border-none print:m-0 print:min-h-0 print:p-0",
               selectedFormat === 'powerpoint' ? 'max-w-[1920px] aspect-video border-[16px] border-orange-200 shadow-2xl rounded-xl' :
               selectedFormat === 'excel' ? 'max-w-[2000px] border-[8px] border-green-200 shadow-inner' :
               selectedFormat === 'jpg' ? 'max-w-[1080px] aspect-[4/5] border-[2px] border-gray-300 !p-0 shadow-2xl' :
               selectedFormat === 'zip' ? 'max-w-[800px] border-[4px] border-dashed border-gray-300 bg-gray-50' :
               selectedFormat === 'html' ? 'max-w-none border-t-[32px] border-gray-800 rounded-t-xl' :
               'max-w-[1250px] min-h-[1056px]',
               dragDropEditMode && 'cursor-text ring-4 ring-blue-400 ring-offset-8 rounded-lg selection:bg-blue-300'
             )}
             style={{
               paddingLeft: selectedFormat === 'jpg' ? '0px' : `${editorLeftMargin}px`,
               paddingRight: selectedFormat === 'jpg' ? '0px' : `${editorRightMargin}px`,
               paddingTop: selectedFormat === 'jpg' ? '0px' : `${editorVerticalMargin}px`,
               paddingBottom: selectedFormat === 'jpg' ? '0px' : `${editorVerticalMargin}px`,
               backgroundColor: DOCUMENT_THEMES[docThemeKey]?.bgValue || '#FFFFFF',
               color: DOCUMENT_THEMES[docThemeKey]?.textValue || '#111827',
               borderColor: DOCUMENT_THEMES[docThemeKey]?.borderValue || '#E5E7EB'
             }}
          >
             {showRuler && (
               <>
                 {/* Horizontal Margin Ruler */}
                 <div className="w-full h-10 border-b border-gray-200 bg-gray-50 flex items-center px-4 relative select-none rounded-t-lg mb-6" contentEditable={false}>
                   {/* Ruler notches */}
                   <div className="absolute inset-x-0 h-4 top-2 flex justify-between px-10 text-[9px] text-gray-400 font-mono">
                     {Array.from({ length: 11 }).map((_, i) => (
                       <div key={i} className="flex flex-col items-center">
                         <span className="h-2 w-px bg-gray-300 mb-0.5"></span>
                         <span>{i} in</span>
                       </div>
                     ))}
                   </div>
                   {/* Left Margin Slider Pin */}
                   <div 
                     title="Drag to Adjust Margins (Left)" onMouseDown={handleLeftMarginMouseDown}
                     className="absolute z-35 cursor-ew-resize flex flex-col items-center group top-1"
                     style={{ left: `${Math.max(10, Math.min(250, editorLeftMargin))}px`, transform: 'translateX(-50%)' }}
                   >
                     <div className="w-3.5 h-3.5 bg-indigo-600 rounded-b-md shadow-md border border-indigo-700 hover:bg-indigo-700"></div>
                     <div className="w-px h-8 bg-indigo-500 opacity-30 group-hover:opacity-100"></div>
                     <input 
                       type="range" 
                       min="20" 
                       max="300" 
                       value={editorLeftMargin}
                        onChange={(e) => setEditorLeftMargin(Number(e.target.value))}
                       className="absolute opacity-0 w-8 h-8 inset-0 cursor-ew-resize z-50 pointer-events-auto"
                     />
                   </div>
                   {/* Right Margin Slider Pin */}
                   <div 
                     title="Drag to Adjust Margins (Right)" onMouseDown={handleRightMarginMouseDown}
                     className="absolute z-35 cursor-ew-resize flex flex-col items-center group top-1"
                     style={{ right: `${Math.max(10, Math.min(250, editorRightMargin))}px`, transform: 'translateX(50%)' }}
                   >
                     <div className="w-3.5 h-3.5 bg-indigo-600 rounded-b-md shadow-md border border-indigo-700 hover:bg-indigo-700"></div>
                     <div className="w-px h-8 bg-indigo-500 opacity-30 group-hover:opacity-100"></div>
                     <input 
                       type="range" 
                       min="20" 
                       max="300" 
                       value={editorRightMargin}
                        onChange={(e) => setEditorRightMargin(Number(e.target.value))}
                       className="absolute opacity-0 w-8 h-8 inset-0 cursor-ew-resize z-50 pointer-events-auto"
                     />
                   </div>
                 </div>

                 {/* Vertical Margin Ruler (Left side margin controller) */}
                 <div className="absolute left-[-40px] top-10 bottom-10 w-8 border-r border-gray-200 bg-gray-50 flex flex-col items-center py-6 select-none rounded-l-lg z-30" contentEditable={false}>
                   {/* Ruler notches going down */}
                   <div className="absolute inset-y-0 w-4 left-2 flex flex-col justify-between py-10 text-[9px] text-gray-400 font-mono">
                     {Array.from({ length: 11 }).map((_, i) => (
                       <div key={i} className="flex items-center gap-1">
                         <span className="w-2 h-px bg-gray-300"></span>
                         <span>{i} in</span>
                       </div>
                     ))}
                   </div>
                   {/* Vertical Margin Slider Pin */}
                   <div 
                     title="Drag to Adjust Margins (Vertical)" onMouseDown={handleVerticalMarginMouseDown}
                     className="absolute z-40 cursor-ns-resize flex items-center group left-1"
                     style={{ top: `${Math.max(10, Math.min(300, editorVerticalMargin))}px`, transform: 'translateY(-50%)' }}
                   >
                     <div className="w-3.5 h-3.5 bg-indigo-600 rounded-b-md shadow-md border border-indigo-700 hover:bg-indigo-700"></div>
                     <div className="h-px w-8 bg-indigo-500 opacity-30 group-hover:opacity-100"></div>
                     <input 
                       type="range" 
                       min="20" 
                       max="300" 
                       value={editorVerticalMargin} 
                       onChange={(e) => setEditorVerticalMargin(Number(e.target.value))}
                       className="absolute opacity-0 w-8 h-8 inset-0 cursor-ns-resize z-50 pointer-events-auto"
                       style={{ transform: 'rotate(90deg)' }}
                     />
                   </div>
                 </div>
               </>
             )}
             {focusMode && (
               <button onClick={() => setFocusMode(false)} className="absolute top-6 right-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 text-sm font-medium z-50 transition-colors">
                 Exit Focus Mode
               </button>
             )}
             {isProcessingAI && (
               <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
                 <div className="relative flex items-center justify-center w-24 h-24 mb-4">
                   <div className="absolute inset-0 border-4 border-t-purple-500 border-r-blue-500 border-b-green-500 border-l-yellow-500 rounded-full animate-spin"></div>
                   <Brain className="w-10 h-10 text-purple-600 animate-pulse" />
                 </div>
                 <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 font-serif. animate-pulse">
                   AI is processing...
                 </h3>
                 <p className="text-gray-500 text-sm mt-2">Please wait while the magic happens</p>
               </div>
             )}
             <div 
               onClick={(e) => {
                 const target = e.target as HTMLElement;
                 const anchor = target.closest('a');
                 if (anchor) {
                   const href = anchor.getAttribute('href');
                   if (href) {
                     e.preventDefault();
                     e.stopPropagation();
                     
                     // 1. Handled Clickable Interactive Pop-ups (Photo or Attachment)
                     if (href.startsWith('popup-photo:') || href.includes('/api/attachments/')) {
                       triggerPopupMediaView(href, anchor.innerText || href);
                       return;
                     }
                     
                     // 2. Base64 Image preview popup fallback
                     if (href.startsWith('data:image/')) {
                       setPopupMediaUrl(href);
                       setPopupMediaType('image');
                       setPopupMediaTitle(anchor.innerText || 'Embedded Image');
                       setPopupPhotoScale(1);
                       setShowPopupMediaViewer(true);
                       return;
                     }
                   }
                 }
                 const doNotUseThisMarker = true; // Temporary flag to bypass duplicate triggers
                 if (anchor) {
                   const href = anchor.getAttribute('href');
                   if (href) {
                     e.preventDefault();
                     e.stopPropagation();
                     if (href.startsWith('data:')) {
                       const downloadName = anchor.getAttribute('download') || 'downloaded-file';
                       const link = document.createElement('a');
                       link.href = href;
                       link.download = downloadName;
                       document.body.appendChild(link);
                       link.click();
                       document.body.removeChild(link);
                       return;
                     }
                     setRedirectTargetUrl(href);
                     setRedirectTargetText(anchor.innerText || href);
                     setShowRedirectModal(true);
                   }
                 }
               }}
               className="w-full relative"
             >
             <EditorContent 
               editor={editor} 
               
               className="outline-none border-none ring-0 focus:outline-none w-full max-w-full overflow-x-hidden relative" 
             />

             </div>

             {/* 10 Modern Doc Features Toolbar */}
             <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-full px-4 py-2 flex items-center gap-4 z-[50] print:hidden w-max mx-auto h-[48px]">
                {/* Live Statistics Counters */}
                {(() => {
                  const txt = editor?.getText() || '';
                  const liveLetterCount = txt.length;
                  const liveWordCount = txt.trim() === '' ? 0 : (txt.match(/\b[-?(\w+)?]+\b/gi) || []).length;
                  const liveLineCount = txt.split('\n').filter(line => line.length > 0).length || (txt ? 1 : 0);

                  return (
                    <div className="flex items-center gap-3 text-slate-600 font-medium font-sans">
                      <div title="Letters Count" className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 rounded-lg py-0.5 shadow-xs">
                        <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Letters:</span>
                        <span className="text-[11px] font-bold font-mono text-indigo-600">{liveLetterCount}</span>
                      </div>
                      
                      <div title="Words Count" className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 rounded-lg py-0.5 shadow-xs">
                        <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Words:</span>
                        <span className="text-[11px] font-bold font-mono text-purple-600">{liveWordCount}</span>
                      </div>

                      <div title="Lines Count" className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 rounded-lg py-0.5 shadow-xs">
                        <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Lines:</span>
                        <span className="text-[11px] font-bold font-mono text-emerald-600">{liveLineCount}</span>
                      </div>

                      <div title="Writing Session Duration" className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-1.5 rounded-lg py-0.5 shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <span className="text-[11px] font-bold font-mono text-amber-700">{formatWriteTime(writeSeconds)}</span>
                      </div>
                    </div>
                  );
                })()}



               <div className="w-px h-6 bg-gray-200 mx-1"></div>

               <button onMouseDown={(e) => e.preventDefault()} onClick={() => {
                   editor?.chain().focus().insertContent('<div data-type="chart-box"></div>').run();
               }} title="Add Interactive Chart" className="text-gray-800 font-bold hover:text-blue-600 transition-colors flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full"><BarChart3 className="w-4 h-4 text-blue-500 animate-pulse"/> <span className="text-[11px] uppercase tracking-wider">Chart Spreadsheet</span></button>

               <div className="w-px h-6 bg-gray-200 mx-1"></div>

               <button onMouseDown={(e) => e.preventDefault()} onClick={() => window.print()} title="Print Document" className="text-gray-500 hover:text-indigo-600 transition-colors tooltip flex items-center gap-1.5"><Printer className="w-4 h-4"/> <span className="text-[11px] font-bold hidden md:inline">Print</span></button>
               <button onMouseDown={(e) => e.preventDefault()} onClick={() => {
                   if (!document.fullscreenElement) document.documentElement.requestFullscreen();
                   else document.exitFullscreen();
               }} title="Toggle Fullscreen" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><Maximize className="w-4 h-4"/></button>
               <button onMouseDown={(e) => e.preventDefault()} onClick={() => {
                   alert("Thesaurus: Highlight a word to find synonyms!");
               }} title="Thesaurus" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><BookOpen className="w-4 h-4"/></button>
               <button onMouseDown={(e) => e.preventDefault()} onClick={() => {
                   window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' });
               }} title="Auto-Scroll Down" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><MoveDown className="w-4 h-4"/></button>
               <button onMouseDown={(e) => e.preventDefault()} onClick={() => {
                   alert("Translating Document (Demo) - Please wait...");
               }} title="Translate" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><Globe className="w-4 h-4"/> <span className="text-[11px] font-bold hidden md:inline">Translate</span></button>
               <button onMouseDown={(e) => e.preventDefault()} onClick={() => {
                   setShowRuler(!showRuler);
               }} title="Toggle Margin Ruler" className={cn("transition-colors flex items-center gap-1.5 focus:outline-none", showRuler ? "text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded animate-pulse" : "text-gray-500 hover:text-indigo-600")}><Scissors className="w-4 h-4"/> <span className="text-[11px] font-bold hidden md:inline">Ruler</span></button>

                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                
                {/* 🎙️ Voice Doc Creator */}
                <button 
                  onMouseDown={(e) => e.preventDefault()} 
                  onClick={() => {
                    setVoiceText("");
                    setVoiceResultStatus("idle");
                    setVoiceCreatorErrorMessage("");
                    setShowVoiceDocModal(true);
                  }} 
                  title="Voice Document Creator (Research & Write)" 
                  className="text-red-500 hover:text-red-600 font-bold hover:bg-red-50 px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 focus:outline-none"
                >
                  <Mic className="w-4 h-4 text-red-500 animate-pulse"/> 
                  <span className="text-[11px] font-bold">Voice Doc</span>
                </button>

                {/* 🚀 Google Doc Export */}
                <button 
                  onClick={handleExportToGoogleDoc} 
                  disabled={isGoogleDocExporting}
                  title={getDocsToken() ? "Export to Google Docs" : "Connect & Export to Google Docs"} 
                  className={cn(
                    "font-bold px-2.5 py-1 rounded transition-all flex items-center gap-1.5 focus:outline-none",
                    isGoogleDocExporting ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  )}
                >
                  {isGoogleDocExporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin"/>
                  ) : (
                    <FileText className="w-4 h-4 text-blue-500"/>
                  )}
                  <span className="text-[11px] font-bold">{isGoogleDocExporting ? "Exporting..." : "Google Doc"}</span>
                </button>

                {/* 🚀 Google Slides Export */}
                <button 
                  onClick={handleExportToGoogleSlides} 
                  disabled={isGoogleSlidesExporting}
                  title={getSlidesToken() ? "Export as Google Slides" : "Connect & Export to Google Slides"} 
                  className={cn(
                    "font-bold px-2.5 py-1 rounded transition-all flex items-center gap-1.5 focus:outline-none",
                    isGoogleSlidesExporting ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  )}
                >
                  {isGoogleSlidesExporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin"/>
                  ) : (
                    <Layers className="w-4 h-4 text-orange-500"/>
                  )}
                  <span className="text-[11px] font-bold">{isGoogleSlidesExporting ? "Slides..." : "Slides"}</span>
                </button>

                {/* 🚀 Google Forms Compile */}
                <button 
                  onClick={handleExportToGoogleForms} 
                  disabled={isGoogleFormsExporting}
                  title={getFormsToken() ? "Compile into Google Form" : "Connect & Compile into Google Form"} 
                  className={cn(
                    "font-bold px-2.5 py-1 rounded transition-all flex items-center gap-1.5 focus:outline-none",
                    isGoogleFormsExporting ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  )}
                >
                  {isGoogleFormsExporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin"/>
                  ) : (
                    <ListChecks className="w-4 h-4 text-emerald-500"/>
                  )}
                  <span className="text-[11px] font-bold">{isGoogleFormsExporting ? "Form..." : "Form"}</span>
                </button>
               <button onClick={() => handleExport('zip')} title="Export as ZIP Backup" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><FileX className="w-4 h-4"/> <span className="text-[11px] font-bold hidden md:inline">ZIP</span></button>
             </div>



             {/* [[ Document Search Dropdown */}
             {showDocSearch && (
               <div className="absolute z-[100] bg-white border border-dc-border shadow-2xl rounded-2xl w-72 overflow-hidden mt-1 p-2 animate-in fade-in zoom-in duration-200">
                  <div className="p-2 border-b border-gray-100 flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input 
                      autoFocus
                      placeholder="Search to link doc..." 
                      className="text-sm outline-none w-full"
                      value={docSearchQuery}
                      onChange={(e) => setDocSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <p className="p-4 text-xs text-center text-gray-400">No documents found...</p>
                    ) : (
                      searchResults.map(doc => (
                        <button 
                          key={doc.id}
                          onClick={() => {
                            editor?.chain().deleteRange({ from: editor.state.selection.from - 2, to: editor.state.selection.from }).insertContent(`<a href="/doc/${doc.id}" class="text-dc-gold font-bold underline decoration-dc-gold/30">[[${doc.title}]]</a> `).run();
                            setShowDocSearch(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-all flex items-center gap-3 group"
                        >
                          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-dc-gold/10 group-hover:text-dc-gold transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{doc.title}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Connect Document</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
               </div>
             )}

             <input type="file" ref={tableImageUploadRef} onChange={handleTableImageUpload} accept="image/*" className="hidden" />
              {editor && (
               <BubbleMenu
                 editor={editor}
                 shouldShow={({ editor }) => (editor.isActive('table') || editor.state.selection.content().size > 0) && !editor.isActive('image')}
                 className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl p-1.5 z-[60] print:hidden"
               >
                 <div onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-1.5">
                   <div className="flex items-center gap-0.5 px-1">
                     <button onClick={() => editor.chain().toggleBold().run()} className={cn("p-2 rounded-xl transition-all", editor.isActive('bold') ? "bg-dc-gold text-white shadow-sm" : "hover:bg-gray-100 text-gray-600")}>
                       <Bold className="w-4 h-4" />
                     </button>
                     <button onClick={() => editor.chain().toggleItalic().run()} className={cn("p-2 rounded-xl transition-all", editor.isActive('italic') ? "bg-dc-gold text-white shadow-sm" : "hover:bg-gray-100 text-gray-600")}>
                       <Italic className="w-4 h-4" />
                     </button>
                     <button onClick={() => editor.chain().toggleUnderline().run()} className={cn("p-2 rounded-xl transition-all", editor.isActive('underline') ? "bg-dc-gold text-white shadow-sm" : "hover:bg-gray-100 text-gray-600")}>
                       <UnderlineIcon className="w-4 h-4" />
                     </button>
                     <div className="w-px h-4 bg-gray-200 mx-1"></div>
                     <button onClick={handleAiAssist} className="p-2 rounded-xl hover:bg-yellow-50 text-dc-gold transition-all flex items-center gap-2 group">
                       <Sparkles className="w-4 h-4" />
                       <span className="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">AI Rewrite</span>
                     </button>
                   </div>
                   
                   {editor.isActive('table') && (
                     <>
                       <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase px-1 mr-1 shrink-0">Table Edit</p>
                       <div className="flex bg-gray-50 rounded border border-gray-100 p-0.5">
                         <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="p-1.5 hover:bg-white hover:text-blue-600 rounded text-gray-500 shadow-sm" title="Add Column Before"><Columns className="w-4 h-4" /></button>
                         <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1.5 hover:bg-white hover:text-blue-600 rounded text-gray-500" title="Add Column After"><Columns className="w-4 h-4" /></button>
                       </div>
                       <div className="flex bg-gray-50 rounded border border-gray-100 p-0.5">
                         <button onClick={() => editor.chain().focus().addRowBefore().run()} className="p-1.5 hover:bg-white hover:text-blue-600 rounded text-gray-500 shadow-sm" title="Add Row Before"><Rows className="w-4 h-4" /></button>
                         <button onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1.5 hover:bg-white hover:text-blue-600 rounded text-gray-500" title="Add Row After"><Rows className="w-4 h-4" /></button>
                       </div>
                       
                       <div className="w-px h-5 bg-gray-200 mx-1"></div>
                       
                       <button onClick={() => tableImageUploadRef.current?.click()} className="p-1.5 text-[11px] font-bold hover:bg-dc-gold/10 hover:text-dc-gold rounded-md text-gray-600 flex items-center gap-1" title="Insert Local Photo">
                          <ImageIcon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Photo</span>
                       </button>
                       <button onClick={handleTableAddLink} className="p-1.5 text-[11px] font-bold hover:bg-purple-50 hover:text-purple-600 rounded-md text-gray-600 flex items-center gap-1" title="Insert URL Link">
                          <LinkIcon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Link</span>
                       </button>

                       <div className="w-px h-5 bg-gray-200 mx-1 shrink-0"></div>

                       <button onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1.5 hover:bg-red-50 text-red-500 rounded" title="Delete Column">
                          <Minus className="w-3.5 h-3.5" />
                       </button>
                       <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-1.5 hover:bg-red-50 text-red-600 rounded" title="Delete Table">
                          <Trash2 className="w-4 h-4" />
                       </button>
                     </>
                   )}

                   {!editor.isActive('table') && (
                     <>
                       <div className="w-px h-5 bg-gray-200 mx-1 shrink-0"></div>
                       <button onClick={handleTableAddLink} className="p-1.5 text-[11px] font-bold hover:bg-purple-50 hover:text-purple-600 rounded-md text-gray-600 flex items-center gap-1" title="Insert URL Link">
                          <LinkIcon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Link</span>
                       </button>
                       <button onClick={() => editor.chain().focus().deleteSelection().run()} className="p-1.5 hover:bg-red-50 text-red-600 rounded ml-1" title="Delete Selection">
                          <Trash2 className="w-4 h-4" />
                       </button>
                     </>
                   )}
                 </div>
               </BubbleMenu>
              )}
          </div>
        </div>
      </div>

      {showDrawModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 shadow-2xl backdrop-blur-sm">
           <div className="bg-[#FAF9F6] border border-gray-200 shadow-2xl w-[800px] h-[600px] rounded-xl flex flex-col overflow-hidden relative">
              <div className="p-4 flex items-center justify-between border-b border-gray-200">
                <div className="flex gap-4 items-center pl-4 w-full justify-between">
                   <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <button onClick={() => setCurrentColor(currentColor)} className="p-2 rounded bg-white shadow-sm border border-gray-200">
                        <PenTool className="w-4 h-4 text-gray-700" />
                      </button>
                      <button onClick={() => setCurrentColor('#FFFFFF')} className="p-2 rounded hover:bg-gray-200">
                        <Eraser className="w-4 h-4 text-gray-700" />
                      </button>
                   </div>
                   
                   <div className="flex items-center gap-2">
                     <span className="font-serif font-bold text-lg">Draw</span>
                   </div>

                   <div className="flex gap-2">
                     <Button variant="outline" onClick={() => setShowDrawModal(false)} className="bg-white">Cancel</Button>
                     <Button variant="gold" onClick={insertDrawing} className="shadow">
                        <CheckSquare className="w-4 h-4 mr-2"/> Insert into doc
                     </Button>
                   </div>
                </div>
              </div>
              
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-center gap-4">
                 <div className="flex gap-1.5">
                   {['#000000', '#D97706', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map(c =>(
                     <button
                       key={c}
                       onClick={() => setCurrentColor(c)}
                       className={`w-7 h-7 rounded-full shadow-sm hover:scale-110 active:scale-95 transition-transform ${currentColor === c ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                       style={{ backgroundColor: c }}
                     />
                   ))}
                 </div>
                 <div className="h-6 w-px bg-gray-300 mx-2"></div>
                 <input type="range" min="1" max="20" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-32 accent-dc-gold" />
                 <span className="text-xs text-gray-500 font-mono w-6">{lineWidth}px</span>
                 
                 <div className="h-6 w-px bg-gray-300 mx-2"></div>
                 <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-black" onClick={() => {
                   const canvas = drawCanvasRef.current;
                   const ctx = canvas?.getContext('2d');
                   if(ctx) { ctx.fillStyle='#FFFFFF'; ctx.fillRect(0,0,800,600); }
                 }} title="Clear Canvas">
                    <Undo className="w-5 h-5" />
                 </button>
              </div>

              <div className="flex-1 bg-white p-6 flex justify-center items-center shadow-inner relative overflow-hidden">
                <canvas 
                   ref={drawCanvasRef}
                   width={760}
                   height={480}
                   onMouseDown={startDrawing}
                   onMouseMove={draw}
                   onMouseUp={stopDrawing}
                   onMouseOut={stopDrawing}
                   className="bg-white cursor-crosshair border border-gray-200 rounded-lg shadow-sm w-full h-full object-contain touch-none"
                />
              </div>
           </div>
        </div>
      )}

      {/* AssemblyAI Robot Dictator */}
      {!focusMode && (
        <RobotDictator 
          editor={editor as any} 
          localEngine={localEngine}
          useLocalModel={useLocalModel}
          onOpenVoiceDoc={() => {
            setVoiceText("");
            setVoiceResultStatus("idle");
            setVoiceCreatorErrorMessage("");
            setShowVoiceDocModal(true);
          }}
        />
      )}
      
      {/* Syntax Library Slider */}
      <SyntaxSlider 
        isOpen={showSyntaxSlider} 
        onClose={() => setShowSyntaxSlider(false)} 
        onSelect={(content: string) => {
           if (editor) {
             editor.chain().focus().insertContent(content).run();
             setShowSyntaxSlider(false);
           }
        }} 
      />

      {/* 🎙️ Voice Doc Creator Modal Interface */}
      {showVoiceDocModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" contentEditable={false}>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col p-6 relative max-h-[90vh] animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                if (isRecordingVoice) toggleVoiceListening();
                setShowVoiceDocModal(false);
              }} 
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
            >
              <X className="w-5 h-5"/>
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                <Mic className="w-6 h-6 text-red-500 animate-pulse"/>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Voice Document Creator</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Synthesize detailed research, charts, links, tables, and formatted text autonomously on any topic.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-6 flex flex-col gap-4">
              {/* Live Microphone Visualization */}
              <div className="flex flex-col items-center justify-center py-5 border border-dashed border-gray-150 rounded-2xl bg-gray-50/50">
                <button 
                  onClick={toggleVoiceListening}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none relative",
                    isRecordingVoice 
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                      : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 text-white cursor-pointer"
                  )}
                >
                  {isRecordingVoice ? (
                    <StopCircle className="w-8 h-8"/>
                  ) : (
                    <Mic className="w-8 h-8"/>
                  )}
                  
                  {/* Pulsing visualizer effect */}
                  {isRecordingVoice && (
                    <span className="absolute inset-0 w-16 h-16 rounded-full border-4 border-red-500 animate-ping opacity-70 inline-block"></span>
                  )}
                </button>
                
                <p className="text-sm font-semibold text-gray-700 mt-3">
                  {isRecordingVoice ? "Listening to your thoughts..." : "Click to Speak"}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                  Supports native browser speech recognition transcription
                </p>

                {/* Simulated Dictation badge capsules */}
                <div className="mt-4 px-4 w-full text-center border-t border-gray-200/50 pt-3">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">💡 Try a Sample Dictated Command</span>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    <button 
                      onClick={() => setVoiceText("Compare React vs Vue.js. Generate a highly comprehensive comparison guide. Focus on virtual DOM differences, library vs framework semantics, and detailed Pros & Cons comparison indices. Include a formatted HTML Table of core stats.")}
                      className="text-[10px] bg-white hover:bg-indigo-50 border border-gray-250 hover:border-indigo-300 text-gray-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-full font-sans font-medium transition-all shadow-xs cursor-pointer focus:outline-none"
                    >
                      🗣️ "Compare React vs Vue.js Guide"
                    </button>
                    <button 
                      onClick={() => setVoiceText("Develop a detailed Q1 Marketing Strategy for a cloud storage startup. Draft target demographic personas, list critical organic advertising milestones, and design an SEO Keyword Matrix comparison table with search volumes.")}
                      className="text-[10px] bg-white hover:bg-indigo-50 border border-gray-250 hover:border-indigo-300 text-gray-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-full font-sans font-medium transition-all shadow-xs cursor-pointer focus:outline-none"
                    >
                      🗣️ "Marketing Launch Plan"
                    </button>
                    <button 
                      onClick={() => setVoiceText("Draft technical release notes for API v4.2. Outlining deprecated payload properties, OAuth scope changes, and future integration deadlines. Present a RACI responsibility table for development teams.")}
                      className="text-[10px] bg-white hover:bg-indigo-50 border border-gray-250 hover:border-indigo-300 text-gray-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-full font-sans font-medium transition-all shadow-xs cursor-pointer focus:outline-none"
                    >
                      🗣️ "API v4.2 Release Notes"
                    </button>
                  </div>
                </div>
              </div>

              {/* Prompt input field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Voice Capture / Command Text Input</label>
                <textarea
                  placeholder="Speak or type what you want to write a document about... e.g., 'Create a comprehensive guide comparing React and Vue.js featuring core differences, formatting highlights, educational links, and reference capability comparisons.'"
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  disabled={voiceResultStatus === "researching"}
                  className="w-full h-32 p-3 border border-gray-200 rounded-xl outline-none text-sm focus:border-indigo-500 transition-colors resize-none placeholder:text-gray-400 font-sans"
                />
              </div>

              {/* Default models status info */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-700 font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span>Model Engine: <strong>{customApiKey ? "Qwen 2.5 (BYOK Cloud)" : localEngine ? "Qwen 2.5 (Local WebLLM)" : "Qwen 2.5 (Cloud Fallback)"}</strong></span>
                </div>
                {customApiKey && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded">
                    BYOK ACTIVE
                  </span>
                )}
              </div>

              {/* Display error messages */}
              {voiceCreatorErrorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs text-red-600 font-sans">
                  <AlertCircle className="w-4 h-4 flex-shrink-0"/>
                  <span>{voiceCreatorErrorMessage}</span>
                </div>
              )}

              {/* Progress / Loading message */}
              {voiceResultStatus === "researching" && (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin"/>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-800 animate-pulse font-sans">Conducting comprehensive research...</p>
                    <p className="text-xs text-gray-400 mt-1 font-sans">Drafting markdown layout, structuring comparisons, constructing references, and styling tables</p>
                  </div>
                </div>
              )}

              {/* Success / Finished indicator */}
              {voiceResultStatus === "ready" && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-xs text-green-700 font-sans">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600"/>
                  <div>
                    <p className="font-bold">Generation Succeeded!</p>
                    <p className="mt-0.5 text-[11px] text-green-600/80">
                      A fully researched article has been automatically styled and injected into your main editor view.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (isRecordingVoice) toggleVoiceListening();
                  setShowVoiceDocModal(false);
                }}
                disabled={voiceResultStatus === "researching"}
                className="rounded-xl font-bold font-sans"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVoiceDocGeneration}
                disabled={voiceResultStatus === "researching" || !voiceText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 focus:outline-none font-bold px-4 font-sans text-sm"
              >
                <Sparkles className="w-4 h-4"/>
                Build Document
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Link Insertion Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 shadow-2xl backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white border-2 border-red-150 shadow-2xl w-[420px] rounded-2xl p-6 flex flex-col relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowLinkModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-rose-50 rounded-full transition-colors focus:outline-none"
            >
              <X className="w-5 h-5"/>
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 bg-rose-50 text-red-500 rounded-xl">
                <LinkIcon className="w-5 h-5"/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-sans">Insert Redirect Link</h3>
                <p className="text-xs text-gray-400 mt-0.5">Define a custom label and target address</p>
              </div>
            </div>
            <div className="space-y-3 my-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Target URL</label>
                <input 
                  type="text" 
                  placeholder="https://example.com" 
                  value={linkModalUrl} 
                  onChange={(e) => setLinkModalUrl(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all font-sans"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Display Text</label>
                <input 
                  type="text" 
                  placeholder="Visit Website..." 
                  value={linkModalText} 
                  onChange={(e) => setLinkModalText(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all font-sans"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button 
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={applyRedirectLink}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 rounded-xl shadow-md cursor-pointer transition-all font-sans"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Native File Attachment Modal */}
      {showFileModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 shadow-2xl backdrop-blur-sm">
          <div className="bg-white border-2 border-red-150 shadow-2xl w-[420px] rounded-2xl p-6 flex flex-col relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowFileModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-rose-50 rounded-full transition-colors focus:outline-none"
            >
              <X className="w-5 h-5"/>
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 bg-rose-50 text-red-500 rounded-xl">
                <Paperclip className="w-5 h-5"/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-sans">Embed File Attachment</h3>
                <p className="text-xs text-gray-400 mt-0.5">Embed as an in-line download node inside exported PDFs</p>
              </div>
            </div>
            <div className="space-y-3 my-4">
              <div className="bg-rose-50/50 border border-dashed border-red-200 p-3 rounded-xl flex items-center justify-between text-xs text-slate-600">
                <span className="truncate font-sans font-medium">{attachedFile?.name || 'document.pdf'}</span>
                <span className="text-[10px] bg-white border border-red-100 text-red-600 font-mono px-2 py-0.5 rounded font-bold whitespace-nowrap">
                  {attachedFile ? `${Math.round(attachedFile.size / 1024)} KB` : '0 KB'}
                </span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Clickable Descriptor Text</label>
                <input 
                  type="text" 
                  placeholder="Download Attached File" 
                  value={attachedFileText} 
                  onChange={(e) => setAttachedFileText(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all font-sans"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button 
                onClick={() => setShowFileModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={applyFileAttachmentLink}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 rounded-xl shadow-md cursor-pointer transition-all font-sans"
              >
                Embed File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Pop-up Photo/Image Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 shadow-2xl backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-pink-150 shadow-2xl w-[420px] rounded-2xl p-6 flex flex-col relative">
            <button 
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors focus:outline-none"
            >
              <X className="w-5 h-5"/>
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 bg-pink-50 text-pink-500 rounded-xl">
                <ImageIcon className="w-5 h-5 animate-pulse"/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-sans">Embed Clickable Photo Pop-up</h3>
                <p className="text-xs text-gray-400 mt-0.5">Embed as a custom pop-up graphic clickable from your text</p>
              </div>
            </div>
            <div className="space-y-3 my-4">
              <div className="bg-pink-50/30 border border-dashed border-pink-200 p-3 rounded-xl flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-8 h-8 rounded bg-cover bg-center shrink-0 border border-pink-100" style={{ backgroundImage: `url(${attachedPhotoBase64})` }}></span>
                  <span className="truncate font-sans font-medium">{attachedPhotoFile?.name || 'photo.png'}</span>
                </div>
                <span className="text-[10px] bg-white border border-pink-150 text-pink-600 font-mono px-2 py-0.5 rounded font-bold whitespace-nowrap">
                  {attachedPhotoFile ? `${Math.round(attachedPhotoFile.size / 1024)} KB` : '0 KB'}
                </span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Clickable Anchor Text</label>
                <input 
                  type="text" 
                  placeholder="e.g. View Photo" 
                  value={attachedPhotoText} 
                  onChange={(e) => setAttachedPhotoText(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all font-sans"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button 
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={applyPhotoAttachmentLink}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90 rounded-xl shadow-md cursor-pointer transition-all font-sans"
              >
                Insert Photo Pop-up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* On-Screen Interactive Media & File Pop-up Viewer */}
      {showPopupMediaViewer && (
        <div className="fixed inset-0 z-[110000] flex flex-col items-center justify-center bg-black/85 shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/60 shadow-2xl w-[90%] max-w-[800px] rounded-2xl flex flex-col overflow-hidden text-white relative max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-900/30 text-pink-400 rounded-lg border border-pink-500/20">
                  {popupMediaType === 'image' ? <ImageIcon className="w-5 h-5"/> : <FileText className="w-5 h-5"/>}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-wide text-slate-100 uppercase font-sans truncate max-w-[400px]">{popupMediaTitle}</h3>
                  <p className="text-[10px] text-pink-400/80 font-bold uppercase tracking-wider mt-0.5">Local Encrypted Sandbox Document</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPopupMediaViewer(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all cursor-pointer focus:outline-none"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* Media Body */}
            <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center bg-slate-950/40 relative min-h-[300px]">
              {loadingPopupMedia ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <Loader2 className="w-12 h-12 text-pink-500 animate-spin"/>
                  <span className="text-xs font-semibold text-slate-400 animate-pulse uppercase tracking-wider">Decrypting Local Node...</span>
                </div>
              ) : popupMediaUrl === '' ? (
                 <div className="text-center text-slate-400 bg-slate-900/50 p-6 rounded-xl border border-slate-800 italic max-w-md">
                   Attachment file contains no decryptable payload or the stream is empty.
                 </div>
              ) : (
                <>
                  {popupMediaType === 'image' && (
                    <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
                      <div className="overflow-auto max-w-full max-h-[50vh] border border-slate-800 rounded-xl bg-slate-900/80 p-2 flex items-center justify-center shadow-inner relative group select-none">
                        <img 
                          src={popupMediaUrl} 
                          alt="Decrypted Media" 
                          className="max-h-[45vh] max-w-full rounded-lg transition-transform duration-200" 
                          referrerPolicy="no-referrer"
                          style={{ transform: `scale(${popupPhotoScale})` }}
                        />
                      </div>
                      
                      {/* Image scale controls */}
                      <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 rounded-full px-3 py-1 font-mono text-xs shadow-lg">
                        <button 
                          onClick={() => setPopupPhotoScale(prev => Math.max(0.5, prev - 0.25))}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Zoom Out"
                        >
                          <Minus className="w-3.5 h-3.5"/>
                        </button>
                        <span className="px-1.5 font-bold text-slate-300 min-w-[50px] text-center">{Math.round(popupPhotoScale * 100)}%</span>
                        <button 
                          onClick={() => setPopupPhotoScale(prev => Math.min(3, prev + 0.25))}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Zoom In"
                        >
                          <Plus className="w-3.5 h-3.5"/>
                        </button>
                        <button 
                          onClick={() => setPopupPhotoScale(1)}
                          className="p-1 text-slate-500 hover:text-slate-300 ml-1 border-l border-slate-800 pl-2 text-[10px] uppercase font-bold"
                          title="Reset Scale"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {popupMediaType === 'pdf' && (
                    <div className="w-full flex flex-col gap-4">
                      {popupMediaUrl.startsWith('data:') ? (
                        <div className="w-full border border-slate-800 rounded-xl bg-slate-900 overflow-hidden relative shadow-2xl">
                          <iframe 
                            src={popupMediaUrl} 
                            className="w-full h-[450px] border-none rounded-xl"
                            title="PDF Document Embed Frame"
                          />
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-slate-900/60 border border-slate-800 rounded-xl max-w-lg mx-auto flex flex-col items-center gap-3">
                          <FileText className="w-12 h-12 text-amber-500 animate-pulse"/>
                          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200">Secure Native PDF Document</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            To view this document securely with perfect styling and layout, click the button below to download the fully decrypted PDF natively to your device.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {popupMediaType === 'other' && (
                    <div className="text-center p-8 bg-slate-900/65 border border-slate-800 rounded-xl max-w-lg mx-auto flex flex-col items-center gap-3">
                      <FileCode className="w-12 h-12 text-pink-400 animate-pulse" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200">Durable Cloud Attachment File</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        This block references a nested document attachment. Accessing sandbox stream is available directly via local secure copy.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer containing snake glower continuous golden rim button */}
            {!loadingPopupMedia && popupMediaUrl !== '' && (
              <div className="px-6 py-4 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[10px] text-slate-500 font-mono italic flex items-center gap-1.5 animate-pulse">
                  <Clock className="w-3 h-3 text-slate-500" /> Sandboxed Node Stream Secure Decrypted
                </div>
                
                {/* Golden rotating rim lightning continuous snake container for download button */}
                <div className="relative p-[2px] overflow-hidden rounded-xl bg-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_22px_rgba(234,179,8,0.55)] transition-all duration-300 w-full sm:w-auto">
                  <div 
                    className="absolute top-1/2 left-1/2 w-[280%] h-[280%] bg-[conic-gradient(from_0deg,transparent_35%,#eab308_45%,#ffffff_55%,#facc15_65%,transparent_75%)]"
                    style={{
                      animation: 'snake-rotate 2.5s linear infinite',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  <button 
                    onClick={handleDownloadFromViewer}
                    className="relative z-10 px-5 py-2.5 bg-slate-950 font-extrabold text-white rounded-[10px] hover:bg-slate-900 cursor-pointer opacity-95 transition-all text-xs tracking-wide uppercase flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Download className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-bounce" />
                    Download Decrypted File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* External Redirect Confirmation Dialog (Frame Security Modal) */}
      {showRedirectModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 shadow-2xl backdrop-blur-sm">
          <div className="bg-white border-2 border-red-200 shadow-2xl w-[450px] rounded-2xl p-6 flex flex-col relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowRedirectModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-rose-50 rounded-full transition-colors focus:outline-none"
            >
              <X className="w-5 h-5"/>
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                <ExternalLink className="w-6 h-6 animate-pulse"/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-sans">Redirect Confirmation</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-sans">You are about to securely redirect outside of the editor</p>
              </div>
            </div>
            
            <div className="my-4 bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Anchor Descriptor:</div>
              <div className="text-sm text-slate-800 font-serif italic border-l-2 border-red-400 pl-3 font-semibold">"{redirectTargetText}"</div>
              
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold pt-2">Destination URL:</div>
              <div className="text-xs font-mono bg-white border border-slate-150 p-2 rounded-lg text-rose-600 break-all w-full max-w-full overflow-x-hidden">{redirectTargetUrl}</div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-4">
              Clicking confirm will launch this web link in a new, secure browser window. Do you want to proceed?
            </p>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowRedirectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all cursor-pointer font-sans"
              >
                Cancel, Stay Here
              </button>
              <button 
                onClick={() => {
                  window.open(redirectTargetUrl, '_blank', 'noopener,noreferrer');
                  setShowRedirectModal(false);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 focus:outline-none transition-all font-sans"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Yes, Live Redirect
              </button>
            </div>
          </div>
        </div>
      )}

      <OfflineNotepad 
        isOpen={showNotepad} 
        onClose={() => setShowNotepad(false)} 
        editor={editor}
      />
    </div>
  )
}



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
import { 
  Wand2, Save, MessageSquare, Send, Bold, Italic, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight, Strikethrough, Superscript as SuperIcon, Subscript as SubIcon,
  Eraser, List, ListOrdered, CheckSquare, Quote, Code, Minus, Link as LinkIcon, Download, Undo, Redo, Eye,
  Palette, Highlighter, Sparkles, PenTool, Languages, MousePointer2, Settings, Type, LayoutList, 
  CheckCircle, FileText, Briefcase, FileCode, Search, RefreshCw, Layers, Mail, FileSearch, ListChecks, Mic, Scale, Table as TableIcon, Zap, Plus,
  Trash2, Image as ImageIcon, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Columns, Rows, FileSpreadsheet, Layout, Brain, Puzzle, ChevronDown, Blocks, Printer, X, BarChart3, Star, Share2, Sigma,
  Maximize, FileX, Scissors, Type as TypeIcon, Globe, MoveDown, BookOpen, Clock
} from 'lucide-react';
import { askGeminiFlash, askGeminiProComplex } from '../lib/gemini';
import { LocalGemmaTerminal } from '../components/LocalGemmaTerminal';
import { MLCEngineInterface } from '@mlc-ai/web-llm';
import { marked } from 'marked';
import { HexColorPicker } from 'react-colorful';

import { RobotDictator } from '../components/RobotDictator';

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
  const [ghostText, setGhostText] = useState('');
  const [isNexusThinking, setIsNexusThinking] = useState(false);
  const [nexusOutput, setNexusOutput] = useState<any>(null);
  const [showDocSearch, setShowDocSearch] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const saveTimeoutRef = useRef<any>(null);
  
  const [customApiKey, setCustomApiKey] = useState('');
  const [showApiKeySetting, setShowApiKeySetting] = useState(false);
  const [useLocalModel, setUseLocalModel] = useState(false);
  const [localEngine, setLocalEngine] = useState<MLCEngineInterface | null>(null);

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

  const handleTabPress = (e: any) => {
    if (e.key === 'Tab' && ghostText) {
      e.preventDefault();
      editor?.chain().insertContent(ghostText).run();
      setGhostText('');
    } else if (e.key === ' ' || e.key === 'Enter') {
      // Predictive Pre-Generation (Ghost Text)
      setTimeout(() => {
        const text = editor?.getText() || '';
        if (text.length > 30 && text.endsWith('.')) {
          setGhostText(' Furthermore, the strategic alignment suggests...');
        }
      }, 800);
    }
  };

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
          const utterance = new SpeechSynthesisUtterance(selectedText || fullText);
          window.speechSynthesis.speak(utterance);
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
         openOnClick: true, 
         autolink: true,
         validate: href => true,
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

      // Ghost Text Heuristic (Mock for demo)
      if (currentLineText.length > 20 && !ghostText) {
          // If sentence seems semi-complete, suggest a professional follow-up
          if (currentLineText.toLowerCase().includes('this document')) {
             setGhostText(' outlines the core features of the platform.');
          } else if (currentLineText.toLowerCase().includes('it is')) {
             setGhostText(' designed for ultimate productivity.');
          }
      } else if (currentLineText.length < 5) {
          setGhostText('');
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
    },
  });

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
                  editor.chain().focus('end').insertContent({ type: 'image', attrs: { src: pendingElement, align: 'center', width: '400px', isFreestyle: true } }).run();
               }, 100);
               localStorage.removeItem('pending_studio_element');
             }

             // Check for pending chart element from Charts Library
             const pendingChart = localStorage.getItem('pending_chart_element');
             if (pendingChart) {
               setTimeout(() => {
                  try {
                    const c = JSON.parse(pendingChart);
                    editor.chain().focus('end').insertContent({ type: 'chartBox', attrs: { title: c.title, chartType: c.type, color: c.color, width: '100%' } }).run();
                  } catch (e) {}
               }, 100);
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
                    editor.chain().focus('end').insertContent({ type: 'mangaPanel', attrs: { frameId: pendingMangaFrame, customLayout, width: '100%', height: 600 } }).run();
                  } catch (e) {}
               }, 100);
               localStorage.removeItem('pending_manga_frame');
             }

             // Check for pending table element from Charts Library
             const pendingTable = localStorage.getItem('pending_table_element');
             if (pendingTable) {
               setTimeout(() => {
                  try {
                    editor.chain().focus('end').insertContent(pendingTable).run();
                  } catch (e) {}
               }, 100);
               localStorage.removeItem('pending_table_element');
             }
             // Check for pending math element
             const pendingMath = localStorage.getItem('pending_math_element');
             if (pendingMath) {
               setTimeout(() => {
                  try {
                    editor.chain().focus('end').insertContent(`<p>$$ ${pendingMath} $$</p>`).run();
                  } catch (e) {}
               }, 100);
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
      if (useLocalModel && localEngine) {
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
      completion = completion.replace(/^```(markdown|text|html)?\n/i, '').replace(/```$/g, '').trim();
      let htmlResponse = completion;
      try {
         htmlResponse = await marked.parse(completion, { async: true });
      } catch (e) {
         htmlResponse = completion;
      }
      editor.commands.insertContent(`\n\n${htmlResponse}`);
    } catch(err: any) {
      alert("Error: " + err.message);
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
      if (useLocalModel && localEngine) {
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
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor?.chain().extendMarkRange('link').unsetLink().run();
      return;
    }

    if (editor?.state.selection.empty) {
      // If no text is selected, just insert the URL as text
      editor?.chain().insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`).run();
    } else {
      editor?.chain().extendMarkRange('link').setLink({ href: url }).run();
    }
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
             margin:       10,
             filename:     `${filename}.pdf`,
             image:        { type: 'jpeg', quality: 0.98 },
             html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 1200, backgroundColor: '#ffffff' },
             jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
           };
           
           // Fix for hidden texts: Clone the editor element, remove contenteditable, and append to body temporarily
           const clone = element.cloneNode(true) as HTMLElement;
           clone.removeAttribute('contenteditable');
           clone.style.position = 'absolute';
           clone.style.top = '-9999px';
           clone.style.left = '0';
           clone.style.width = '800px';
           clone.style.padding = '40px';
           clone.style.backgroundColor = '#ffffff';
           document.body.appendChild(clone);

           await (html2pdf as any)().from(clone).set(opt).save();
           document.body.removeChild(clone);
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
                const clone = element.cloneNode(true) as HTMLElement;
                clone.removeAttribute('contenteditable');
                clone.style.position = 'absolute';
                clone.style.top = '-9999px';
                clone.style.width = '800px';
                clone.style.padding = '40px';
                clone.style.backgroundColor = '#ffffff';
                document.body.appendChild(clone);

                const canvas = await (html2canvas as any)(clone, { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1200 });
                document.body.removeChild(clone);
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
      if (useLocalModel && localEngine) {
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
      if (useLocalModel && localEngine) {
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
        <header className="p-6 border-b border-dc-border flex justify-between items-center bg-white z-[9999] shadow-sm relative shrink-0 print:hidden">
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
                              if(linkText) {
                                 editor?.chain().insertContent(`<a href="${linkUrl}" target="_blank">${linkText}</a>`).run();
                              } else {
                                 editor?.chain().setLink({ href: linkUrl }).run();
                              }
                           }
                           setShowInsertMenu(false);
                         }} className="w-full bg-blue-500 text-white text-xs py-1 rounded">Add Link</button>
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
             <button title="Toggle WebLLM" onClick={() => setUseLocalModel(!useLocalModel)} className={`px-3 py-2 rounded border flex items-center gap-2 text-xs transition-colors ${useLocalModel ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
               <Layers className="w-4 h-4"/> 
               <span>{useLocalModel ? 'Local AI Mode' : 'Cloud AI Mode'}</span>
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

             <Button variant="outline" size="sm" onClick={handleAiAssist} disabled={saving} className="border-purple-200 hover:bg-purple-50 text-purple-700">
               <Wand2 className="w-4 h-4 mr-2" /> Autocomplete
             </Button>
             
             <Button variant="outline" size="sm" onClick={() => setShowSyntaxSlider(true)} className="border-teal-200 hover:bg-teal-50 text-teal-700">
               <BarChart3 className="w-4 h-4 mr-2" /> Syntax Library
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
              <button title="Bold" onClick={() => editor?.chain().toggleBold().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <Bold className="w-4 h-4" />
              </button>
              <button title="Italic" onClick={() => editor?.chain().toggleItalic().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <Italic className="w-4 h-4" />
              </button>
              <button title="Underline" onClick={() => editor?.chain().toggleUnderline().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('underline') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <button title="Strikethrough" onClick={() => editor?.chain().toggleStrike().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('strike') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <Strikethrough className="w-4 h-4" />
              </button>
              <button title="Subscript" onClick={() => editor?.chain().toggleSubscript().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('subscript') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <SubIcon className="w-4 h-4" />
              </button>
              <button title="Superscript" onClick={() => editor?.chain().toggleSuperscript().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('superscript') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <SuperIcon className="w-4 h-4" />
              </button>
              <button title="Clear Formatting" onClick={() => editor?.chain().clearNodes().unsetAllMarks().run()} className="p-1.5 flex-shrink-0 rounded hover:bg-gray-200 text-gray-600">
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
              <button title="Bullet List" onClick={() => editor?.chain().toggleBulletList().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <List className="w-4 h-4" />
              </button>
              <button title="Numbered List" onClick={() => editor?.chain().toggleOrderedList().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <ListOrdered className="w-4 h-4" />
              </button>
              <button title="Task List" onClick={() => editor?.chain().toggleTaskList().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('taskList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <CheckSquare className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
              <button title="Blockquote" onClick={() => editor?.chain().toggleBlockquote().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('blockquote') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <Quote className="w-4 h-4" />
              </button>
              <button title="Code Block" onClick={() => editor?.chain().toggleCodeBlock().run()} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('codeBlock') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <Code className="w-4 h-4" />
              </button>
              <button title="Attach File (Embed inside document)" onClick={() => {
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
                           const attachmentHtml = `<a href="${base64Data}" download="${file.name}" class="text-blue-600 underline font-medium bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1">📎 ${file.name}</a>&nbsp;`;
                           editor.chain().insertContent(attachmentHtml).run();
                        }
                     };
                     reader.readAsDataURL(file);
                   }
                 };
                 input.click();
              }} className={`p-1.5 flex-shrink-0 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('link') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}>
                <LinkIcon className="w-4 h-4" />
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
                   <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-xl w-72 z-[100] backdrop-blur-md bg-white/95 p-3 flex flex-wrap gap-2 animate-in fade-in zoom-in-95">
                      {['>','[','{','=','\\','°','€','√','|','•','~','`','£','¢','©','®','™','✓','✗','★','☆','♡','♥','♪','♫','∞','∑','π','Ω','µ','∂','∆','§','¶','†','‡','♣','♦','♥','♠','←','↑','→','↓','↔','↕','≈','≠','≤','≥','±','÷','×','½','¼','¾','©','®','™','°','℃','℉'].map(sym => (
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
              <button 
                title="Docs Theme Canvas" 
                onClick={() => {}} 
                className="p-1.5 flex-shrink-0 rounded hover:bg-gray-200 text-gray-600 hover:scale-110 transition-all ml-1"
              >
                <Palette className="w-5 h-5" />
              </button>
              <button title="Focus Mode" onClick={() => setFocusMode(true)} className="p-1.5 flex-shrink-0 rounded hover:bg-gray-200 text-gray-600 ml-1">
                <Eye className="w-4 h-4" />
              </button>
              {/* Productivity Tools Hub (previously summarize) */}
              <button title="Productivity Tools & Plugins" onClick={() => navigate(`/doc/${id}/summarize`)} className="p-1.5 flex-shrink-0 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 ml-1 transition-colors flex items-center">
                <Blocks className="w-4 h-4 ml-0.5" />
                <span className="text-[10px] uppercase font-bold ml-1.5 mr-1 tracking-wider">Hub</span>
              </button>
            </div>
        </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-[#EFEFEF] flex justify-center items-start gap-8 relative print:bg-white print:p-0 print:overflow-visible">
          <div className={cn(
             "flex-1 w-full bg-white px-12 py-16 md:px-20 md:py-24 shadow-xl border border-gray-200 h-fit transition-all duration-500 mb-20 text-black relative outline-none print:shadow-none print:border-none print:m-0 print:min-h-0 print:p-0",
             selectedFormat === 'powerpoint' ? 'max-w-[1920px] aspect-video border-[16px] border-orange-200 shadow-2xl rounded-xl' :
             selectedFormat === 'excel' ? 'max-w-[2000px] border-[8px] border-green-200 shadow-inner' :
             selectedFormat === 'jpg' ? 'max-w-[1080px] aspect-[4/5] border-[2px] border-gray-300 !p-0 shadow-2xl' :
             selectedFormat === 'zip' ? 'max-w-[800px] border-[4px] border-dashed border-gray-300 bg-gray-50' :
             selectedFormat === 'html' ? 'max-w-none border-t-[32px] border-gray-800 rounded-t-xl' :
             'max-w-[1250px] min-h-[1056px]',
             dragDropEditMode && 'cursor-text ring-4 ring-blue-400 ring-offset-8 rounded-lg selection:bg-blue-300'
          )}>
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
             <EditorContent 
               editor={editor} 
               onKeyDown={handleTabPress}
               className="outline-none border-none ring-0 focus:outline-none w-full max-w-full overflow-x-hidden relative" 
             />

             {/* 10 Modern Doc Features Toolbar */}
             <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-full px-4 py-2 flex items-center gap-4 z-[50] print:hidden w-max mx-auto h-[48px]">
               <button onClick={() => {
                   const text = editor?.getText() || '';
                   const words = (text.match(/\b[-?(\w+)?]+\b/gi) || []).length;
                   alert(`Word Count: ${words} words\nCharacters: ${text.length}`);
               }} title="Word Count" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><TypeIcon className="w-4 h-4"/> <span className="text-[11px] font-bold hidden md:inline">Words</span></button>

               <button onClick={() => {
                   const text = editor?.getText() || '';
                   const words = (text.match(/\b[-?(\w+)?]+\b/gi) || []).length;
                   alert(`Estimated Read Time: ${Math.max(1, Math.ceil(words / 200))} min`);
               }} title="Read Time" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><Clock className="w-4 h-4"/> <span className="text-[11px] font-bold hidden md:inline">Time</span></button>

               <div className="w-px h-6 bg-gray-200 mx-1"></div>

               <button onClick={() => {
                   editor?.chain().focus().insertContent('<div data-type="flowchart-box"></div>').run();
               }} title="Add Flowchart" className="text-gray-700 font-bold hover:text-blue-600 transition-colors flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded"><Blocks className="w-4 h-4"/> <span className="text-[11px] uppercase">Flowchart</span></button>

               <div className="w-px h-6 bg-gray-200 mx-1"></div>

               <button onClick={() => window.print()} title="Print Document" className="text-gray-500 hover:text-indigo-600 transition-colors tooltip flex items-center gap-1.5"><Printer className="w-4 h-4"/> <span className="text-[11px] font-bold hidden md:inline">Print</span></button>
               <button onClick={() => {
                   if (!document.fullscreenElement) document.documentElement.requestFullscreen();
                   else document.exitFullscreen();
               }} title="Toggle Fullscreen" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><Maximize className="w-4 h-4"/></button>
               <button onClick={() => {
                   alert("Thesaurus: Highlight a word to find synonyms!");
               }} title="Thesaurus" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><BookOpen className="w-4 h-4"/></button>
               <button onClick={() => {
                   window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' });
               }} title="Auto-Scroll Down" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><MoveDown className="w-4 h-4"/></button>
               <button onClick={() => {
                   alert("Translating Document (Demo) - Please wait...");
               }} title="Translate" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><Globe className="w-4 h-4"/> <span className="text-[11px] font-bold hidden md:inline">Translate</span></button>
               <button onClick={() => {
                   alert("Margins customized!");
               }} title="Toggle Margin Ruler" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><Scissors className="w-4 h-4"/> <span className="text-[11px] font-bold hidden md:inline">Ruler</span></button>
               <button onClick={() => handleExport('zip')} title="Export as ZIP Backup" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"><FileX className="w-4 h-4"/> <span className="text-[11px] font-bold hidden md:inline">ZIP</span></button>
             </div>

             {/* Ghost Text Overlay */}
             {ghostText && editor && !editor.state.selection.content().size && (
                <div 
                  className="absolute pointer-events-none text-gray-300 select-none whitespace-pre-wrap"
                  style={{
                    left: 0, // In dynamic apps we'd calculate coordinates, but here we can at least show intended behavior
                    top: 0,
                    opacity: 0.5,
                    marginLeft: '4px'
                  }}
                >
                  {/* Simplified ghost display - in real app would match cursor position precisely */}
                </div>
             )}

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
               </BubbleMenu>
             )}
          </div>
        </div>
      </div>

      {showDrawModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 shadow-2xl backdrop-blur-sm">
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
      {!focusMode && <RobotDictator editor={editor as any} />}
      
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
    </div>
  )
}



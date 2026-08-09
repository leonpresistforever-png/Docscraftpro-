import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { Video, Image as ImageIcon, Volume2 } from 'lucide-react';
import { generateImage, textToSpeech, generateMusic, generateVideo, pollVideoOperation } from '../lib/gemini';

export function MediaLab() {
  const [tab, setTab] = useState<'image' | 'video' | 'audio'>('image');

  const [prompt, setPrompt] = useState('');

  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3">("16:9");

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultAudio, setResultAudio] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setStatusMessage(null);
    setResultImage(null);
    setResultAudio(null);
    setResultVideo(null);

    try {
      if (tab === 'image') {
        const res = await generateImage(prompt, imageSize, aspectRatio);
        setResultImage(res);
      } else if (tab === 'audio') {
        const isMusic = prompt.toLowerCase().includes('music') || prompt.toLowerCase().includes('song');
        if (isMusic) {
          const res = await generateMusic(prompt);
          setResultAudio(`data:${res.mimeType};base64,${res.audioBase64}`);
        } else {
          const raw = await textToSpeech(prompt);
          if (raw) setResultAudio(`data:audio/mp3;base64,${raw}`);
        }
      } else if (tab === 'video') {
        setStatusMessage('Starting video generation with Veo — this may take several minutes...');
        const operation = await generateVideo(prompt, aspectRatio as '16:9' | '9:16');
        const videoUrl = await pollVideoOperation(operation, (msg) => setStatusMessage(msg));
        if (videoUrl) {
          setResultVideo(videoUrl);
          setStatusMessage('Video ready!');
        }
      }
    } catch (err: any) {
      setStatusMessage(null);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-dc-bg-page font-sans text-dc-text">
      <Sidebar />
      <div className="flex-1 flex flex-col pt-8">
        <header className="px-12 pb-6 border-b border-dc-border">
          <h1 className="text-4xl font-serif font-bold tracking-tight">AI Media Lab</h1>
          <p className="text-lg text-dc-text-muted mt-2">Generate high-quality images, video (Veo), TTS, and music (Lyria).</p>
        </header>

        <div className="px-12 py-6 border-b border-dc-border flex gap-4 bg-white/50">
          <Button variant={tab === 'image' ? 'default' : 'outline'} onClick={() => setTab('image')}>
            <ImageIcon className="w-4 h-4 mr-2" /> Images
          </Button>
          <Button variant={tab === 'video' ? 'default' : 'outline'} onClick={() => setTab('video')}>
            <Video className="w-4 h-4 mr-2" /> Videos
          </Button>
          <Button variant={tab === 'audio' ? 'default' : 'outline'} onClick={() => setTab('audio')}>
            <Volume2 className="w-4 h-4 mr-2" /> Audio/Music
          </Button>
        </div>

        <div className="flex-1 px-12 py-8 grid grid-cols-1 lg:grid-cols-4 gap-12 overflow-y-auto">
          <div className="lg:col-span-1 border border-dc-border bg-white rounded-2xl p-8 shadow-sm flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">Prompt</label>
              <textarea
                className="w-full border border-dc-border rounded-lg p-3 outline-none focus:border-dc-gold min-h-[120px]"
                placeholder="Describe what you want to create..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
            </div>

            {tab === 'image' && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-2">Aspect Ratio</label>
                  <select className="w-full border border-dc-border rounded-md p-2" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)}>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:3">4:3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Quality / Size</label>
                  <select className="w-full border border-dc-border rounded-md p-2" value={imageSize} onChange={(e) => setImageSize(e.target.value as typeof imageSize)}>
                    <option value="1K">1K</option>
                    <option value="2K">2K</option>
                    <option value="4K">4K (Pro only, subject to quota)</option>
                  </select>
                </div>
              </>
            )}

            {tab === 'video' && (
              <div>
                <label className="block text-sm font-bold mb-2">Aspect Ratio</label>
                <select className="w-full border border-dc-border rounded-md p-2" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)}>
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                </select>
                <p className="text-xs text-amber-600 mt-2">Video generation with Veo can take up to several minutes.</p>
              </div>
            )}

            {tab === 'audio' && (
              <div>
                <p className="text-xs text-dc-text-muted mt-2">Include the word &quot;music&quot; or &quot;song&quot; in your prompt to use Lyria generation; otherwise TTS is used.</p>
              </div>
            )}

            <Button variant="gold" className="w-full" onClick={handleGenerate} disabled={loading || !prompt}>
              {loading ? 'Generating...' : 'Generate Content'}
            </Button>

            {statusMessage && (
              <p className="text-xs text-dc-text-muted bg-amber-50 border border-amber-100 rounded-lg p-3">{statusMessage}</p>
            )}
          </div>

          <div className="lg:col-span-3 border border-dc-border bg-[#F5F5F3] rounded-2xl flex items-center justify-center overflow-hidden min-h-[600px] shadow-inner">
            {!resultImage && !resultAudio && !resultVideo && !loading && (
              <div className="text-center opacity-40">
                {tab === 'image' && <ImageIcon className="w-16 h-16 mx-auto mb-2" />}
                {tab === 'video' && <Video className="w-16 h-16 mx-auto mb-2" />}
                {tab === 'audio' && <Volume2 className="w-16 h-16 mx-auto mb-2" />}
                <p>Output preview will appear here</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center animate-pulse px-8 text-center">
                <div className="w-12 h-12 border-4 border-dc-gold border-t-transparent rounded-full animate-spin mb-4" />
                <p>{statusMessage || 'Crafting your media...'}</p>
              </div>
            )}

            {resultImage && !loading && tab === 'image' && (
              <img src={resultImage} alt="Generated" className="max-w-full max-h-full object-contain" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }} />
            )}

            {resultVideo && !loading && tab === 'video' && (
              <video src={resultVideo} controls autoPlay className="max-w-full max-h-full" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }} />
            )}

            {resultAudio && !loading && tab === 'audio' && (
              <div className="p-8 bg-white rounded-xl shadow-sm">
                <audio controls src={resultAudio} autoPlay />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

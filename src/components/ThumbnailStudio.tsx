'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Code, Globe, Layout, Image as ImageIcon, Download, Loader2, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import { drawBentoWebpage, drawApiMockup, drawBackground, drawPattern, PRESETS, PATTERNS, CARD_PRESETS } from '../lib/canvasUtils';

export default function ThumbnailStudio() {
  const [mode, setMode] = useState<'web' | 'api'>('web');
  const [url, setUrl] = useState('https://vercel.com');
  const [preset, setPreset] = useState(PRESETS['16:9']);
  const [cardPreset, setCardPreset] = useState('16:9');
  const [loading, setLoading] = useState(false);
  const [webImage, setWebImage] = useState<HTMLImageElement | null>(null);
  
  // API Mode States
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiUrl, setApiUrl] = useState('https://api.portfolio.dev/v1/projects');
  const [apiStatus, setApiStatus] = useState('200 OK');
  const [apiJson, setApiJson] = useState('{\n  "status": "success",\n  "data": {\n    "total_projects": 24\n  }\n}');

  // Configuration States
  const [bgTheme, setBgTheme] = useState('green');
  const [viewHeight, setViewHeight] = useState(900);
  const [rotation, setRotation] = useState(-15);
  const [blur, setBlur] = useState(60);
  
  // Bento States
  const [scale, setScale] = useState(0.5);
  const [gap, setGap] = useState(40);
  const [edgeBlur, setEdgeBlur] = useState(80);
  const [vignetteColor, setVignetteColor] = useState<'black' | 'white'>('black');
  const [bentoBorderRadius, setBentoBorderRadius] = useState(20);

  // API Text Scale
  const [textScale, setTextScale] = useState(1.0);
  const [apiBorderRadius, setApiBorderRadius] = useState(16);

  // Export Settings
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  // Pattern
  const [bgPattern, setBgPattern] = useState('none');
  const [patternOpacity, setPatternOpacity] = useState(15);

  // Accordion State — only mode-specific section open by default
  const [expanded, setExpanded] = useState({
    target: true,
    apiConfig: true,
    theme: false,
    pattern: false,
    bento: false,
    dimensions: false
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchScreenshot = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, fullPage: true })
      });
      if (!res.ok) throw new Error('Failed to fetch screenshot');
      
      const blob = await res.blob();
      const imgUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.src = imgUrl;
      img.onload = () => {
        setWebImage(img);
        setLoading(false);
      };
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('Error fetching screenshot. Check console.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      setWebImage(img);
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = preset.width;
    canvas.height = preset.height;

    drawBackground(ctx, canvas.width, canvas.height, bgTheme);
    drawPattern(ctx, canvas.width, canvas.height, bgPattern, patternOpacity);

    if (mode === 'web') {
      if (webImage) {
        drawBentoWebpage(ctx, canvas.width, canvas.height, webImage, {
          viewHeight,
          rotation,
          blur,
          scale,
          gap,
          edgeBlur,
          vignetteColor,
          borderRadius: bentoBorderRadius
        });
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Enter URL or Upload Image to generate Bento', canvas.width / 2, canvas.height / 2);
      }
    } else {
      drawApiMockup(ctx, canvas.width, canvas.height, { method: apiMethod, url: apiUrl, status: apiStatus, json: apiJson }, {
        rotation,
        scale,
        edgeBlur,
        vignetteColor,
        textScale,
        borderRadius: apiBorderRadius,
        cardAspect: CARD_PRESETS[cardPreset].ratio
      });
    }
  }, [mode, preset, cardPreset, webImage, bgTheme, bgPattern, patternOpacity, viewHeight, rotation, blur, scale, gap, edgeBlur, vignetteColor, bentoBorderRadius, textScale, apiBorderRadius, apiMethod, apiUrl, apiStatus, apiJson]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    
    const mimeType = `image/${exportFormat}`;
    const extension = exportFormat === 'jpeg' ? 'jpg' : exportFormat;
    
    link.download = `thumbnail-${Date.now()}.${extension}`;
    link.href = canvas.toDataURL(mimeType, 0.9);
    link.click();
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #111827; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563; 
        }
      `}</style>

      <div className="flex flex-col lg:flex-row h-screen bg-[#0b0f17] text-gray-100 font-sans overflow-hidden">
        
        {/* Sidebar Settings */}
        <div className="w-full lg:w-96 border-r border-gray-800 bg-[#111827] flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="p-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#111827] z-10 shadow-sm">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <Layout className="w-5 h-5 text-blue-500" />
              Thumbnail Studio
            </h1>
          </div>

          <div className="p-5 space-y-6">
            <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
              <button 
                onClick={() => setMode('web')}
                className={`flex-1 py-2 text-sm font-medium rounded-md flex justify-center items-center gap-2 transition-all ${mode === 'web' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                <Globe className="w-4 h-4" /> Web Bento
              </button>
              <button 
                onClick={() => setMode('api')}
                className={`flex-1 py-2 text-sm font-medium rounded-md flex justify-center items-center gap-2 transition-all ${mode === 'api' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                <Code className="w-4 h-4" /> API Mode
              </button>
            </div>

            {/* WEB MODE CONTROLS */}
            {mode === 'web' && (
              <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
                <button onClick={() => toggleSection('target')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                  <span className="text-sm font-semibold text-gray-300">Target</span>
                  {expanded.target ? <ChevronDown className="w-4 h-4 text-gray-500"/> : <ChevronRight className="w-4 h-4 text-gray-500"/>}
                </button>
                {expanded.target && (
                  <div className="p-4 space-y-4 border-t border-gray-800">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <button 
                        onClick={fetchScreenshot}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800"></span></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#111827] px-2 text-gray-500">Or Override with Image</span></div>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 border-dashed rounded-lg px-4 py-3 text-sm text-gray-300 font-medium flex justify-center items-center gap-2 transition-all"
                    >
                      <Upload className="w-4 h-4" /> Upload Full Screenshot
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* API MODE CONTROLS */}
            {mode === 'api' && (
              <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
                <button onClick={() => toggleSection('apiConfig')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                  <span className="text-sm font-semibold text-gray-300">API Configuration</span>
                  {expanded.apiConfig ? <ChevronDown className="w-4 h-4 text-gray-500"/> : <ChevronRight className="w-4 h-4 text-gray-500"/>}
                </button>
                {expanded.apiConfig && (
                  <div className="p-4 space-y-4 border-t border-gray-800">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Method</label>
                        <select value={apiMethod} onChange={(e) => setApiMethod(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-xs font-bold text-green-400 focus:outline-none focus:border-blue-500">
                          <option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="DELETE">DELETE</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-400 mb-1">URL Path</label>
                        <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Status Code</label>
                      <select value={apiStatus} onChange={(e) => setApiStatus(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-blue-500">
                        <option value="200 OK">200 OK</option><option value="201 Created">201 Created</option><option value="400 Bad Request">400 Bad Request</option><option value="404 Not Found">404 Not Found</option><option value="500 Error">500 Error</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">JSON Payload</label>
                      <textarea rows={6} value={apiJson} onChange={(e) => setApiJson(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono text-green-400 focus:outline-none focus:border-blue-500 resize-y custom-scrollbar" spellCheck={false} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COMMON THEME SETTINGS */}
            <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
              <button onClick={() => toggleSection('theme')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                <span className="text-sm font-semibold text-gray-300">Background Theme</span>
                {expanded.theme ? <ChevronDown className="w-4 h-4 text-gray-500"/> : <ChevronRight className="w-4 h-4 text-gray-500"/>}
              </button>
              {expanded.theme && (
                <div className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <button onClick={() => setBgTheme('green')} className={`w-8 h-8 rounded-full bg-lime-500 ${bgTheme==='green' ? 'ring-2 ring-white': ''}`}></button>
                    <button onClick={() => setBgTheme('ocean')} className={`w-8 h-8 rounded-full bg-blue-600 ${bgTheme==='ocean' ? 'ring-2 ring-white': ''}`}></button>
                    <button onClick={() => setBgTheme('sunset')} className={`w-8 h-8 rounded-full bg-rose-500 ${bgTheme==='sunset' ? 'ring-2 ring-white': ''}`}></button>
                    <button onClick={() => setBgTheme('dark')} className={`w-8 h-8 rounded-full bg-slate-800 border border-gray-600 ${bgTheme==='dark' ? 'ring-2 ring-white': ''}`}></button>
                    <button onClick={() => setBgTheme('white')} className={`w-8 h-8 rounded-full bg-white border border-gray-300 ${bgTheme==='white' ? 'ring-2 ring-blue-500': ''}`}></button>
                  </div>
                </div>
              )}
            </div>

            {/* BACKGROUND PATTERN */}
            <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
              <button onClick={() => toggleSection('pattern')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                <span className="text-sm font-semibold text-gray-300">Background Pattern</span>
                {expanded.pattern ? <ChevronDown className="w-4 h-4 text-gray-500"/> : <ChevronRight className="w-4 h-4 text-gray-500"/>}
              </button>
              {expanded.pattern && (
                <div className="p-4 space-y-4 border-t border-gray-800">
                  <div className="grid grid-cols-4 gap-2">
                    {PATTERNS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setBgPattern(p.id)}
                        className={`py-2 px-1 rounded-lg border text-center text-[10px] font-medium transition-all leading-tight ${bgPattern === p.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'}`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                  {bgPattern !== 'none' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400"><span>Opacity</span><span>{patternOpacity}%</span></div>
                      <input type="range" min="1" max="80" value={patternOpacity} onChange={(e) => setPatternOpacity(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SHARED STYLING (USED BY BOTH WEB BENTO & API) */}
            <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
              <button onClick={() => toggleSection('bento')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                <span className="text-sm font-semibold text-gray-300">{mode === 'web' ? 'Bento Styling' : 'Window Styling'}</span>
                {expanded.bento ? <ChevronDown className="w-4 h-4 text-gray-500"/> : <ChevronRight className="w-4 h-4 text-gray-500"/>}
              </button>
              {expanded.bento && (
                <div className="p-4 space-y-4 border-t border-gray-800">
                  
                  {mode === 'web' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400"><span>Viewheight (Slice)</span><span>{viewHeight}px</span></div>
                      <input type="range" min="400" max="1500" step="50" value={viewHeight} onChange={(e) => setViewHeight(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400"><span>{mode === 'web' ? 'Grid Rotation' : 'Window Rotation'}</span><span>{rotation}°</span></div>
                    <input type="range" min="-45" max="45" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full accent-blue-500" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400"><span>{mode === 'web' ? 'Bento Scale' : 'Window Scale'}</span><span>{scale.toFixed(2)}x</span></div>
                    <input type="range" min="0.2" max="1.5" step="0.05" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                  </div>

                  {mode === 'api' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400"><span>Text Scale</span><span>{textScale.toFixed(2)}x</span></div>
                      <input type="range" min="0.5" max="2.5" step="0.05" value={textScale} onChange={(e) => setTextScale(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                  )}

                  {mode === 'web' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400"><span>Grid Gap</span><span>{gap}px</span></div>
                      <input type="range" min="0" max="200" step="5" value={gap} onChange={(e) => setGap(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                  )}

                  {mode === 'web' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400"><span>Drop Shadow Blur</span><span>{blur}px</span></div>
                      <input type="range" min="0" max="100" value={blur} onChange={(e) => setBlur(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400"><span>Radial Vignette Area</span><span>{edgeBlur}%</span></div>
                    <input type="range" min="0" max="100" value={edgeBlur} onChange={(e) => setEdgeBlur(parseInt(e.target.value))} className="w-full accent-blue-500" />
                  </div>

                  {mode === 'web' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400"><span>Card Border Radius</span><span>{bentoBorderRadius}px</span></div>
                      <input type="range" min="0" max="80" value={bentoBorderRadius} onChange={(e) => setBentoBorderRadius(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                  )}

                  {mode === 'api' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400"><span>Window Border Radius</span><span>{apiBorderRadius}px</span></div>
                      <input type="range" min="0" max="48" value={apiBorderRadius} onChange={(e) => setApiBorderRadius(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => setVignetteColor('black')} className={`flex-1 py-1 text-xs rounded border ${vignetteColor === 'black' ? 'bg-gray-800 border-blue-500 text-white' : 'border-gray-700 text-gray-400'}`}>Dark Vignette</button>
                    <button onClick={() => setVignetteColor('white')} className={`flex-1 py-1 text-xs rounded border ${vignetteColor === 'white' ? 'bg-gray-200 border-blue-500 text-black font-medium' : 'border-gray-700 text-gray-400'}`}>Light Vignette</button>
                  </div>
                </div>
              )}
            </div>

            {/* CANVAS DIMENSIONS */}
            <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden mb-6">
              <button onClick={() => toggleSection('dimensions')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                <span className="text-sm font-semibold text-gray-300">Dimensions</span>
                {expanded.dimensions ? <ChevronDown className="w-4 h-4 text-gray-500"/> : <ChevronRight className="w-4 h-4 text-gray-500"/>}
              </button>
              {expanded.dimensions && (
                <div className="p-4 space-y-5 border-t border-gray-800">
                  
                  {/* Canvas size */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Canvas Size</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(PRESETS).map(([key, val]) => (
                        <button 
                          key={key}
                          onClick={() => setPreset(val)}
                          className={`p-3 rounded-lg border text-left transition-all ${preset.name === val.name ? 'bg-gray-800 border-blue-500' : 'bg-gray-900 border-gray-800 hover:border-gray-600'}`}
                        >
                          <div className="text-sm font-semibold text-white">{val.name}</div>
                          <div className="text-[10px] text-gray-400 mt-1">{val.width} × {val.height}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card / Window aspect ratio — API mode only */}
                  {mode === 'api' && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Window Aspect Ratio</p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(CARD_PRESETS).map(([key, val]) => (
                          <button
                            key={key}
                            onClick={() => setCardPreset(key)}
                            className={`py-2 px-1 rounded-lg border text-center text-xs font-semibold transition-all ${cardPreset === key ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'}`}
                          >
                            {val.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#090b10] p-8 relative" style={{ backgroundImage: 'radial-gradient(#1f293d 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          
          <div className="absolute top-6 right-6 flex gap-2 z-10">
            <select 
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="bg-gray-800 text-white text-sm font-medium rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
            >
              <option value="png">PNG (HQ)</option>
              <option value="jpeg">JPG (Web)</option>
              <option value="webp">WEBP (Optimized)</option>
            </select>

            <button 
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-blue-900/20"
            >
              <Download className="w-4 h-4" /> Download
            </button>
          </div>

          <div className="max-w-full max-h-full flex items-center justify-center p-4">
            <canvas 
              ref={canvasRef} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-gray-800"
              style={{ 
                aspectRatio: `${preset.width}/${preset.height}`,
                maxHeight: '80vh' 
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

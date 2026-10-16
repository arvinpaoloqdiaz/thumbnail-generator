'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Code, Globe, Layout, Image as ImageIcon, Download, Loader2, Upload, ChevronDown, ChevronRight, Link2, Pipette, Trash2, Move, Tag, BookMarked, Save, FolderOpen } from 'lucide-react';
import { drawBentoWebpage, drawApiMockup, drawBackground, drawPattern, PRESETS, PATTERNS, CARD_PRESETS } from '../lib/canvasUtils';

type SubjectPresetPosition = 'center' | 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';

export default function ThumbnailStudio() {
  const [mode, setMode] = useState<'web' | 'api'>('web');
  const [targetTab, setTargetTab] = useState<'url' | 'upload'>('url');
  const [url, setUrl] = useState('https://vercel.com');
  const [preset, setPreset] = useState(PRESETS['16:9']);
  const [cardPreset, setCardPreset] = useState('16:9');
  const [loading, setLoading] = useState(false);
  const [webImage, setWebImage] = useState<HTMLImageElement | null>(null);

  // Main Subject Overlay States
  const [subjectImage, setSubjectImage] = useState<HTMLImageElement | null>(null);
  const [subjectPreset, setSubjectPreset] = useState<SubjectPresetPosition>('bottom-right');
  const [subjectScale, setSubjectScale] = useState(0.45);
  const [subjectRotation, setSubjectRotation] = useState(0); // -180 to 180 degrees
  const [subjectXOffset, setSubjectXOffset] = useState(0); // Offset % from preset (-100% to 100%)
  const [subjectYOffset, setSubjectYOffset] = useState(0); // Offset % from preset (-100% to 100%)
  const [subjectOpacity, setSubjectOpacity] = useState(100);
  const [subjectShadow, setSubjectShadow] = useState(true);

  // API Mode States
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiUrl, setApiUrl] = useState('https://api.portfolio.dev/v1/projects');
  const [apiStatus, setApiStatus] = useState('200 OK');
  const [apiJson, setApiJson] = useState('{\n  "status": "success",\n  "data": {\n    "total_projects": 24\n  }\n}');

  // Configuration States
  const [bgTheme, setBgTheme] = useState('green');
  const [customColor, setCustomColor] = useState('#fac6d0');
  const [viewHeight, setViewHeight] = useState(900);
  const [rotation, setRotation] = useState(-15);
  const [blur, setBlur] = useState(60);

  // Bento States
  const [scale, setScale] = useState(0.5);
  const [bentoAlignment, setBentoAlignment] = useState<'center' | 'left' | 'right'>('center');
  const [bentoXOffset, setBentoXOffset] = useState(0); // Offset % from center (-60% to 60%)
  const [bentoYOffset, setBentoYOffset] = useState(0); // Offset % from center (-60% to 60%)
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
  const [patternColor, setPatternColor] = useState('#ffffff');

  // Branding Watermark
  const [brandingEnabled, setBrandingEnabled] = useState(false);
  const [brandingColor, setBrandingColor] = useState('#ffffff');
  const [brandingPosition, setBrandingPosition] = useState<'top-left'|'top'|'top-right'|'left'|'center'|'right'|'bottom-left'|'bottom'|'bottom-right'>('bottom-right');
  const [brandingScale, setBrandingScale] = useState(1.0);
  const [brandingRotation, setBrandingRotation] = useState(0);
  const [brandingXOffset, setBrandingXOffset] = useState(0);
  const [brandingYOffset, setBrandingYOffset] = useState(0);
  const [brandingOpacity, setBrandingOpacity] = useState(80);

  // Presets
  const [presetList, setPresetList] = useState<{ name: string; file: string; createdAt: string | null }[]>([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [activePresetName, setActivePresetName] = useState('');
  const [presetSaving, setPresetSaving] = useState(false);

  // Accordion State — only mode-specific section open by default
  const [expanded, setExpanded] = useState({
    presets: true,
    target: true,
    subject: true,
    apiConfig: true,
    theme: false,
    pattern: false,
    bento: false,
    branding: false,
    dimensions: false
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subjectFileInputRef = useRef<HTMLInputElement>(null);
  const fontsReadyRef = useRef(false);

  // ── Preset helpers ──────────────────────────────────────────────────
  const getSettings = () => ({
    mode,
    bgTheme, customColor,
    viewHeight, rotation, blur, scale, bentoAlignment, bentoXOffset, bentoYOffset,
    gap, edgeBlur, vignetteColor, bentoBorderRadius,
    textScale, apiBorderRadius, exportFormat,
    bgPattern, patternOpacity, patternColor,
    subjectPreset, subjectScale, subjectRotation, subjectXOffset, subjectYOffset, subjectOpacity, subjectShadow,
    brandingEnabled, brandingColor, brandingPosition, brandingScale, brandingRotation, brandingXOffset, brandingYOffset, brandingOpacity,
    cardPreset,
    presetKey: Object.keys(PRESETS).find(k => PRESETS[k as keyof typeof PRESETS].name === preset.name) || '16:9',
    apiMethod, apiUrl, apiStatus, apiJson,
  });

  const applySettings = (s: ReturnType<typeof getSettings> & Record<string, any>) => {
    if (s.mode) setMode(s.mode);
    if (s.bgTheme) setBgTheme(s.bgTheme);
    if (s.customColor) setCustomColor(s.customColor);
    if (s.viewHeight !== undefined) setViewHeight(s.viewHeight);
    if (s.rotation !== undefined) setRotation(s.rotation);
    if (s.blur !== undefined) setBlur(s.blur);
    if (s.scale !== undefined) setScale(s.scale);
    if (s.bentoAlignment) setBentoAlignment(s.bentoAlignment);
    if (s.bentoXOffset !== undefined) setBentoXOffset(s.bentoXOffset);
    if (s.bentoYOffset !== undefined) setBentoYOffset(s.bentoYOffset);
    if (s.gap !== undefined) setGap(s.gap);
    if (s.edgeBlur !== undefined) setEdgeBlur(s.edgeBlur);
    if (s.vignetteColor) setVignetteColor(s.vignetteColor);
    if (s.bentoBorderRadius !== undefined) setBentoBorderRadius(s.bentoBorderRadius);
    if (s.textScale !== undefined) setTextScale(s.textScale);
    if (s.apiBorderRadius !== undefined) setApiBorderRadius(s.apiBorderRadius);
    if (s.exportFormat) setExportFormat(s.exportFormat);
    if (s.bgPattern) setBgPattern(s.bgPattern);
    if (s.patternOpacity !== undefined) setPatternOpacity(s.patternOpacity);
    if (s.patternColor) setPatternColor(s.patternColor);
    if (s.subjectPreset) setSubjectPreset(s.subjectPreset);
    if (s.subjectScale !== undefined) setSubjectScale(s.subjectScale);
    if (s.subjectRotation !== undefined) setSubjectRotation(s.subjectRotation);
    if (s.subjectXOffset !== undefined) setSubjectXOffset(s.subjectXOffset);
    if (s.subjectYOffset !== undefined) setSubjectYOffset(s.subjectYOffset);
    if (s.subjectOpacity !== undefined) setSubjectOpacity(s.subjectOpacity);
    if (s.subjectShadow !== undefined) setSubjectShadow(s.subjectShadow);
    if (s.brandingEnabled !== undefined) setBrandingEnabled(s.brandingEnabled);
    if (s.brandingColor) setBrandingColor(s.brandingColor);
    if (s.brandingPosition) setBrandingPosition(s.brandingPosition);
    if (s.brandingScale !== undefined) setBrandingScale(s.brandingScale);
    if (s.brandingRotation !== undefined) setBrandingRotation(s.brandingRotation);
    if (s.brandingXOffset !== undefined) setBrandingXOffset(s.brandingXOffset);
    if (s.brandingYOffset !== undefined) setBrandingYOffset(s.brandingYOffset);
    if (s.brandingOpacity !== undefined) setBrandingOpacity(s.brandingOpacity);
    if (s.cardPreset) setCardPreset(s.cardPreset);
    if (s.presetKey && PRESETS[s.presetKey as keyof typeof PRESETS]) setPreset(PRESETS[s.presetKey as keyof typeof PRESETS]);
    if (s.apiMethod) setApiMethod(s.apiMethod);
    if (s.apiUrl) setApiUrl(s.apiUrl);
    if (s.apiStatus) setApiStatus(s.apiStatus);
    if (s.apiJson) setApiJson(s.apiJson);
  };

  const loadPresetList = async () => {
    try {
      const res = await fetch('/api/presets');
      const data = await res.json();
      setPresetList(data);
    } catch { /* ignore */ }
  };

  const handleLoadPreset = async () => {
    if (!selectedPreset) return;
    try {
      const res = await fetch(`/api/presets/${encodeURIComponent(selectedPreset)}`);
      const data = await res.json();
      if (data.settings) {
        applySettings(data.settings);
        setActivePresetName(selectedPreset);
      }
    } catch { alert('Failed to load preset.'); }
  };

  const handleSavePreset = async () => {
    if (!activePresetName) { handleSaveAsPreset(); return; }
    setPresetSaving(true);
    try {
      await fetch(`/api/presets/${encodeURIComponent(activePresetName)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: getSettings() })
      });
      await loadPresetList();
    } catch { alert('Failed to save preset.'); } finally { setPresetSaving(false); }
  };

  const handleSaveAsPreset = async () => {
    const name = window.prompt('Preset name:', activePresetName || '');
    if (!name || !name.trim()) return;
    setPresetSaving(true);
    try {
      const res = await fetch('/api/presets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), settings: getSettings() })
      });
      const data = await res.json();
      if (data.error) {
        // Offer to overwrite
        if (window.confirm(`"${name.trim()}" already exists. Overwrite?`)) {
          await fetch(`/api/presets/${encodeURIComponent(name.trim())}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings: getSettings() })
          });
          setActivePresetName(name.trim());
          setSelectedPreset(name.trim());
        }
      } else {
        setActivePresetName(data.name);
        setSelectedPreset(data.name);
      }
      await loadPresetList();
    } catch { alert('Failed to save preset.'); } finally { setPresetSaving(false); }
  };

  const handleDeletePreset = async () => {
    if (!selectedPreset) return;
    if (!window.confirm(`Delete preset "${selectedPreset}"?`)) return;
    try {
      await fetch(`/api/presets/${encodeURIComponent(selectedPreset)}`, { method: 'DELETE' });
      if (activePresetName === selectedPreset) setActivePresetName('');
      setSelectedPreset('');
      await loadPresetList();
    } catch { alert('Failed to delete preset.'); }
  };
  // ────────────────────────────────────────────────────────────────────

  // Preload branding fonts once on mount
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const interFace = new FontFace('BrandInter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2)');
        const gvFace = new FontFace('BrandGreatVibes', 'url(https://fonts.gstatic.com/s/greatvibes/v19/RWmMoKWR9v4ksMfaWd_JN-XCg6UKDXlCZA.woff2)');
        await Promise.all([interFace.load(), gvFace.load()]);
        document.fonts.add(interFace);
        document.fonts.add(gvFace);
      } catch (_) { /* network may be unavailable */ } finally {
        fontsReadyRef.current = true;
      }
    };
    loadFonts();
    loadPresetList();
  }, []);

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

  const handleSubjectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      setSubjectImage(img);
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
    drawPattern(ctx, canvas.width, canvas.height, bgPattern, patternOpacity, patternColor);

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
          borderRadius: bentoBorderRadius,
          offsetX: bentoXOffset,
          offsetY: bentoYOffset,
          alignment: bentoAlignment
        });
      } else {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Prominent, large typography
        const baseTitleSize = Math.max(48, Math.round(canvas.width * 0.046)); // ~88px at 1920x1080
        const baseSubSize = Math.max(22, Math.round(canvas.width * 0.021));   // ~40px at 1920x1080

        const isLightTheme = bgTheme === 'white' || bgTheme === 'pink' || bgTheme === '#fac6d0';

        // Primary title
        ctx.fillStyle = isLightTheme ? 'rgba(15, 23, 42, 0.95)' : '#ffffff';
        ctx.font = `800 ${baseTitleSize}px var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText('Enter URL or Upload Image to generate Bento', canvas.width / 2, canvas.height / 2 - (baseSubSize * 0.8));

        // Helper subtext
        ctx.fillStyle = isLightTheme ? 'rgba(51, 65, 85, 0.75)' : 'rgba(255, 255, 255, 0.70)';
        ctx.font = `500 ${baseSubSize}px var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText('Use the left panel to fetch a webpage or choose a screenshot', canvas.width / 2, canvas.height / 2 + (baseTitleSize * 0.65));
        ctx.restore();
      }
    } else {
      drawApiMockup(ctx, canvas.width, canvas.height, { method: apiMethod, url: apiUrl, status: apiStatus, json: apiJson }, {
        rotation,
        scale,
        edgeBlur,
        vignetteColor,
        textScale,
        borderRadius: apiBorderRadius,
        cardAspect: CARD_PRESETS[cardPreset].ratio,
        offsetX: bentoXOffset,
        offsetY: bentoYOffset
      });
    }

    // DRAW MAIN SUBJECT OVERLAY (clipped strictly to canvas boundary)
    if (subjectImage) {
      ctx.save();
      // Clip to canvas boundaries so anything crossing outside is strictly hidden
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.clip();

      const aspect = subjectImage.width / subjectImage.height;
      // Scale relative to canvas height
      const targetHeight = canvas.height * subjectScale;
      const targetWidth = targetHeight * aspect;

      // Calculate anchor coordinates based on preset
      const padding = 48; // Edge padding
      let baseLeft = 0;
      let baseTop = 0;

      switch (subjectPreset) {
        case 'center':
          baseLeft = (canvas.width - targetWidth) / 2;
          baseTop = (canvas.height - targetHeight) / 2;
          break;
        case 'left':
          baseLeft = padding;
          baseTop = (canvas.height - targetHeight) / 2;
          break;
        case 'right':
          baseLeft = canvas.width - targetWidth - padding;
          baseTop = (canvas.height - targetHeight) / 2;
          break;
        case 'top':
          baseLeft = (canvas.width - targetWidth) / 2;
          baseTop = padding;
          break;
        case 'bottom':
          baseLeft = (canvas.width - targetWidth) / 2;
          baseTop = canvas.height - targetHeight - padding;
          break;
        case 'top-left':
          baseLeft = padding;
          baseTop = padding;
          break;
        case 'top-right':
          baseLeft = canvas.width - targetWidth - padding;
          baseTop = padding;
          break;
        case 'bottom-left':
          baseLeft = padding;
          baseTop = canvas.height - targetHeight - padding;
          break;
        case 'bottom-right':
          baseLeft = canvas.width - targetWidth - padding;
          baseTop = canvas.height - targetHeight - padding;
          break;
        case 'custom':
          baseLeft = (canvas.width - targetWidth) / 2;
          baseTop = (canvas.height - targetHeight) / 2;
          break;
      }

      // Apply custom offsets (percentage of canvas dimensions)
      const finalLeft = baseLeft + (subjectXOffset / 100) * canvas.width;
      const finalTop = baseTop + (subjectYOffset / 100) * canvas.height;

      ctx.globalAlpha = subjectOpacity / 100;

      if (subjectShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 16;
      } else {
        ctx.shadowColor = 'transparent';
      }

      // Render rotated around center of subject
      const centerX = finalLeft + targetWidth / 2;
      const centerY = finalTop + targetHeight / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      if (subjectRotation !== 0) {
        ctx.rotate((subjectRotation * Math.PI) / 180);
      }
      ctx.drawImage(subjectImage, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
      ctx.restore();

      ctx.restore();
    }

    // DRAW BRANDING WATERMARK (synchronous — fonts are preloaded on mount)
    if (brandingEnabled) {
      const pad = Math.round(canvas.width * 0.03);
      const craftedSize = Math.round(canvas.width * 0.011 * brandingScale);
      const weddsiteSize = Math.round(canvas.width * 0.038 * brandingScale);
      const lineGap = Math.round(craftedSize * 0.3);
      const totalH = craftedSize + lineGap + weddsiteSize;

      const hex = brandingColor.replace('#', '');
      const rC = parseInt(hex.substring(0, 2), 16);
      const gC = parseInt(hex.substring(2, 4), 16);
      const bC = parseInt(hex.substring(4, 6), 16);
      const alpha = brandingOpacity / 100;

      let baseX = 0;
      let baseY = 0;
      switch (brandingPosition) {
        case 'top-left':     baseX = pad;                        baseY = pad; break;
        case 'top':          baseX = canvas.width / 2;           baseY = pad; break;
        case 'top-right':    baseX = canvas.width - pad;         baseY = pad; break;
        case 'left':         baseX = pad;                        baseY = (canvas.height - totalH) / 2; break;
        case 'center':       baseX = canvas.width / 2;           baseY = (canvas.height - totalH) / 2; break;
        case 'right':        baseX = canvas.width - pad;         baseY = (canvas.height - totalH) / 2; break;
        case 'bottom-left':  baseX = pad;                        baseY = canvas.height - pad - totalH; break;
        case 'bottom':       baseX = canvas.width / 2;           baseY = canvas.height - pad - totalH; break;
        case 'bottom-right': baseX = canvas.width - pad;         baseY = canvas.height - pad - totalH; break;
      }

      const anchorX = baseX + (brandingXOffset / 100) * canvas.width;
      const anchorY = baseY + (brandingYOffset / 100) * canvas.height;
      const rotCenterX = anchorX;
      const rotCenterY = anchorY + totalH / 2;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(rotCenterX, rotCenterY);
      if (brandingRotation !== 0) ctx.rotate((brandingRotation * Math.PI) / 180);
      ctx.translate(-rotCenterX, -rotCenterY);
      ctx.textBaseline = 'top';
      ctx.textAlign = 'right';
      ctx.fillStyle = `rgb(${rC},${gC},${bC})`;

      ctx.font = `100 ${craftedSize}px BrandInter, Inter, sans-serif`;
      ctx.fillText('crafted by', anchorX, anchorY);

      ctx.font = `${weddsiteSize}px BrandGreatVibes, 'Great Vibes', cursive`;
      ctx.fillText('Weddsite', anchorX, anchorY + craftedSize + lineGap);

      ctx.restore();
    }


  }, [
    mode, preset, cardPreset, webImage, bgTheme, bgPattern, patternOpacity, patternColor, 
    viewHeight, rotation, blur, scale, bentoAlignment, bentoXOffset, bentoYOffset, gap, edgeBlur, vignetteColor, bentoBorderRadius, 
    textScale, apiBorderRadius, apiMethod, apiUrl, apiStatus, apiJson,
    subjectImage, subjectPreset, subjectScale, subjectRotation, subjectXOffset, subjectYOffset, subjectOpacity, subjectShadow,
    brandingEnabled, brandingColor, brandingPosition, brandingScale, brandingRotation, brandingXOffset, brandingYOffset, brandingOpacity
  ]);

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
            {/* ── PRESETS ── */}
            <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
              <button onClick={() => toggleSection('presets')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-amber-400" />
                  Presets
                  {activePresetName && (
                    <span className="text-[10px] font-normal text-amber-300 bg-amber-900/40 px-1.5 py-0.5 rounded">{activePresetName}</span>
                  )}
                </span>
                {expanded.presets ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {expanded.presets && (
                <div className="p-4 space-y-3 border-t border-gray-800">
                  {/* Dropdown + Load */}
                  <div className="flex gap-2">
                    <select
                      value={selectedPreset}
                      onChange={(e) => setSelectedPreset(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500 min-w-0"
                    >
                      <option value="">-- Select preset --</option>
                      {presetList.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleLoadPreset}
                      disabled={!selectedPreset}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
                    >
                      <FolderOpen className="w-3.5 h-3.5" /> Load
                    </button>
                  </div>

                  {/* Save actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSavePreset}
                      disabled={presetSaving}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-gray-200 rounded-lg transition-colors disabled:opacity-40"
                      title={activePresetName ? `Overwrite "${activePresetName}"` : 'Save (will prompt for name)'}
                    >
                      {presetSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      {activePresetName ? 'Save' : 'Save...'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAsPreset}
                      disabled={presetSaving}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-gray-200 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <Save className="w-3.5 h-3.5" /> Save As
                    </button>
                    <button
                      type="button"
                      onClick={handleDeletePreset}
                      disabled={!selectedPreset}
                      className="p-2 text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors border border-gray-800 rounded-lg hover:border-red-900"
                      title={`Delete "${selectedPreset}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {activePresetName && (
                    <p className="text-[11px] text-amber-400/70">
                      Loaded: <span className="font-medium">{activePresetName}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-gray-500">
                    Presets are saved as JSON in <code className="text-gray-400">public/presets/</code>.
                  </p>
                </div>
              )}
            </div>

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
                  {expanded.target ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
                {expanded.target && (
                  <div className="p-4 space-y-4 border-t border-gray-800">
                    {/* Tab Navigation */}
                    <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                      <button
                        type="button"
                        onClick={() => setTargetTab('url')}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${targetTab === 'url'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-200'
                          }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetTab('upload')}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${targetTab === 'upload'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-200'
                          }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Screenshot
                      </button>
                    </div>

                    {/* Tab 1: URL Input */}
                    {targetTab === 'url' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-400">Website URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 font-mono"
                          />
                          <button
                            onClick={fetchScreenshot}
                            disabled={loading || !url}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
                            title="Capture Screenshot"
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500">Fetches and renders a full-page screenshot of the target site.</p>
                      </div>
                    )}

                    {/* Tab 2: Upload Full Screenshot */}
                    {targetTab === 'upload' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-400">Upload Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700 border-dashed rounded-lg px-4 py-5 text-sm text-gray-300 font-medium flex flex-col justify-center items-center gap-2 transition-all group"
                        >
                          <div className="p-2.5 rounded-full bg-gray-800 group-hover:bg-gray-700 text-blue-400 transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="font-medium text-gray-200">Upload Full Screenshot</span>
                          <span className="text-xs text-gray-500 font-normal">PNG, JPG, or WebP</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* API MODE CONTROLS */}
            {mode === 'api' && (
              <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
                <button onClick={() => toggleSection('apiConfig')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                  <span className="text-sm font-semibold text-gray-300">API Configuration</span>
                  {expanded.apiConfig ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
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

            {/* MAIN SUBJECT OVERLAY */}
            <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
              <button onClick={() => toggleSection('subject')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  Main Subject
                  {subjectImage && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </span>
                {expanded.subject ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {expanded.subject && (
                <div className="p-4 space-y-4 border-t border-gray-800">
                  <input
                    type="file"
                    accept="image/*"
                    ref={subjectFileInputRef}
                    onChange={handleSubjectUpload}
                    className="hidden"
                  />

                  {!subjectImage ? (
                    <button
                      type="button"
                      onClick={() => subjectFileInputRef.current?.click()}
                      className="w-full bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700 border-dashed rounded-lg px-4 py-4 text-sm text-gray-300 font-medium flex flex-col justify-center items-center gap-1.5 transition-all group"
                    >
                      <div className="p-2 rounded-full bg-gray-800 group-hover:bg-gray-700 text-blue-400 transition-colors">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-200 text-xs">Upload Main Subject</span>
                      <span className="text-[11px] text-gray-500">Person cutout, product, device, badge</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {/* Active Subject Bar */}
                      <div className="flex items-center justify-between bg-gray-950 p-2.5 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span className="text-xs text-gray-300 truncate">Main Subject Active</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => subjectFileInputRef.current?.click()}
                            className="px-2 py-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => setSubjectImage(null)}
                            title="Remove subject"
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Preset Position Buttons */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-400">Position Preset</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'top-left', label: 'Top Left' },
                            { id: 'top', label: 'Top Center' },
                            { id: 'top-right', label: 'Top Right' },
                            { id: 'left', label: 'Left Edge' },
                            { id: 'center', label: 'Center' },
                            { id: 'right', label: 'Right Edge' },
                            { id: 'bottom-left', label: 'Bottom Left' },
                            { id: 'bottom', label: 'Bottom Center' },
                            { id: 'bottom-right', label: 'Bottom Right' },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => {
                                setSubjectPreset(pos.id as SubjectPresetPosition);
                                setSubjectXOffset(0);
                                setSubjectYOffset(0);
                              }}
                              className={`py-1.5 px-1.5 rounded-md text-[11px] font-medium transition-all ${
                                subjectPreset === pos.id && subjectXOffset === 0 && subjectYOffset === 0
                                  ? 'bg-blue-600 text-white shadow'
                                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Scale Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Subject Scale</span>
                          <span>{Math.round(subjectScale * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="2.0"
                          step="0.02"
                          value={subjectScale}
                          onChange={(e) => setSubjectScale(parseFloat(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      {/* Rotation Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Subject Rotation</span>
                          <span className="flex items-center gap-1.5">
                            {subjectRotation !== 0 && (
                              <button
                                type="button"
                                onClick={() => setSubjectRotation(0)}
                                className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                              >
                                reset
                              </button>
                            )}
                            <span>{subjectRotation}°</span>
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          step="1"
                          value={subjectRotation}
                          onChange={(e) => setSubjectRotation(parseInt(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      {/* Custom X Offset Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Custom Horizontal (X)</span>
                          <span>{subjectXOffset > 0 ? `+${subjectXOffset}%` : `${subjectXOffset}%`}</span>
                        </div>
                        <input
                          type="range"
                          min="-60"
                          max="60"
                          step="1"
                          value={subjectXOffset}
                          onChange={(e) => setSubjectXOffset(parseInt(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      {/* Custom Y Offset Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Custom Vertical (Y)</span>
                          <span>{subjectYOffset > 0 ? `+${subjectYOffset}%` : `${subjectYOffset}%`}</span>
                        </div>
                        <input
                          type="range"
                          min="-60"
                          max="60"
                          step="1"
                          value={subjectYOffset}
                          onChange={(e) => setSubjectYOffset(parseInt(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      {/* Opacity Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Opacity</span>
                          <span>{subjectOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={subjectOpacity}
                          onChange={(e) => setSubjectOpacity(parseInt(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      {/* Drop shadow & boundary clip notice */}
                      <div className="pt-1 flex items-center justify-between text-xs border-t border-gray-800">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                          <input
                            type="checkbox"
                            checked={subjectShadow}
                            onChange={(e) => setSubjectShadow(e.target.checked)}
                            className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-0"
                          />
                          <span>Soft Drop Shadow</span>
                        </label>
                        <span className="text-[10px] text-gray-500">Boundary hidden</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COMMON THEME SETTINGS */}
            <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
              <button onClick={() => toggleSection('theme')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                <span className="text-sm font-semibold text-gray-300">Background Theme</span>
                {expanded.theme ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {expanded.theme && (
                <div className="p-4 space-y-3 border-t border-gray-800">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      title="Lime Green"
                      onClick={() => setBgTheme('green')}
                      className={`w-8 h-8 rounded-full bg-lime-500 transition-all ${bgTheme === 'green' ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                    />
                    <button
                      title="Ocean Blue"
                      onClick={() => setBgTheme('ocean')}
                      className={`w-8 h-8 rounded-full bg-blue-600 transition-all ${bgTheme === 'ocean' ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                    />
                    <button
                      title="Sunset"
                      onClick={() => setBgTheme('sunset')}
                      className={`w-8 h-8 rounded-full bg-rose-500 transition-all ${bgTheme === 'sunset' ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                    />
                    <button
                      title="Pastel Pink (#fac6d0)"
                      onClick={() => { setBgTheme('pink'); setCustomColor('#fac6d0'); }}
                      style={{ backgroundColor: '#fac6d0' }}
                      className={`w-8 h-8 rounded-full border border-pink-300 transition-all ${bgTheme === 'pink' || bgTheme === '#fac6d0' ? 'ring-2 ring-pink-400 scale-110 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                    />
                    <button
                      title="Dark Slate"
                      onClick={() => setBgTheme('dark')}
                      className={`w-8 h-8 rounded-full bg-slate-800 border border-gray-600 transition-all ${bgTheme === 'dark' ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                    />
                    <button
                      title="Clean White"
                      onClick={() => setBgTheme('white')}
                      className={`w-8 h-8 rounded-full bg-white border border-gray-300 transition-all ${bgTheme === 'white' ? 'ring-2 ring-blue-500 scale-110 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                    />

                    {/* Custom Color Picker Swatch */}
                    <label
                      title="Pick Custom Color"
                      className={`relative w-8 h-8 rounded-full cursor-pointer flex items-center justify-center border transition-all ${bgTheme.startsWith('#') && bgTheme !== '#fac6d0'
                        ? 'ring-2 ring-blue-500 scale-110 shadow-lg border-blue-400'
                        : 'border-dashed border-gray-600 hover:border-gray-400 hover:scale-105 bg-gray-800/80'
                        }`}
                      style={{
                        backgroundColor: bgTheme.startsWith('#') && bgTheme !== '#fac6d0' ? customColor : undefined
                      }}
                    >
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomColor(val);
                          setBgTheme(val);
                        }}
                        className="sr-only"
                      />
                      <Pipette className={`w-3.5 h-3.5 ${bgTheme.startsWith('#') && bgTheme !== '#fac6d0' ? 'text-gray-900 drop-shadow-sm' : 'text-gray-400'}`} />
                    </label>
                  </div>

                  {/* Custom Hex Value Preview / Manual Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-[11px] text-gray-400 font-medium">Custom Color:</label>
                    <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-md px-2 py-1">
                      <span className="w-3 h-3 rounded-full border border-gray-700" style={{ backgroundColor: customColor }} />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomColor(val);
                          if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val)) {
                            setBgTheme(val);
                          }
                        }}
                        placeholder="#fac6d0"
                        className="w-20 bg-transparent text-xs text-gray-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BACKGROUND PATTERN */}
            <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
              <button onClick={() => toggleSection('pattern')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                <span className="text-sm font-semibold text-gray-300">Background Pattern</span>
                {expanded.pattern ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
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
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400"><span>Opacity</span><span>{patternOpacity}%</span></div>
                        <input type="range" min="1" max="80" value={patternOpacity} onChange={(e) => setPatternOpacity(parseInt(e.target.value))} className="w-full accent-blue-500" />
                      </div>

                      {/* Pattern Color Controls */}
                      <div className="space-y-2 pt-1 border-t border-gray-800">
                        <label className="block text-xs font-medium text-gray-400">Pattern Color</label>
                        <div className="flex items-center gap-2.5">
                          {/* Default White */}
                          <button
                            type="button"
                            title="White (Default)"
                            onClick={() => setPatternColor('#ffffff')}
                            className={`w-7 h-7 rounded-full bg-white border border-gray-300 transition-all ${patternColor.toLowerCase() === '#ffffff'
                              ? 'ring-2 ring-blue-500 scale-110 shadow'
                              : 'opacity-80 hover:opacity-100 hover:scale-105'
                              }`}
                          />
                          {/* Slate/Dark */}
                          <button
                            type="button"
                            title="Dark Slate"
                            onClick={() => setPatternColor('#0f172a')}
                            className={`w-7 h-7 rounded-full bg-slate-900 border border-gray-600 transition-all ${patternColor.toLowerCase() === '#0f172a'
                              ? 'ring-2 ring-blue-500 scale-110 shadow'
                              : 'opacity-80 hover:opacity-100 hover:scale-105'
                              }`}
                          />

                          {/* Custom Color Picker Swatch */}
                          <label
                            title="Custom Pattern Color"
                            className={`relative w-7 h-7 rounded-full cursor-pointer flex items-center justify-center border transition-all ${patternColor.toLowerCase() !== '#ffffff' && patternColor.toLowerCase() !== '#0f172a'
                              ? 'ring-2 ring-blue-500 scale-110 shadow border-blue-400'
                              : 'border-dashed border-gray-600 hover:border-gray-400 hover:scale-105 bg-gray-800/80'
                              }`}
                            style={{
                              backgroundColor:
                                patternColor.toLowerCase() !== '#ffffff' && patternColor.toLowerCase() !== '#0f172a'
                                  ? patternColor
                                  : undefined,
                            }}
                          >
                            <input
                              type="color"
                              value={patternColor}
                              onChange={(e) => setPatternColor(e.target.value)}
                              className="sr-only"
                            />
                            <Pipette
                              className={`w-3 h-3 ${patternColor.toLowerCase() !== '#ffffff' && patternColor.toLowerCase() !== '#0f172a'
                                ? 'text-gray-900 drop-shadow-sm'
                                : 'text-gray-400'
                                }`}
                            />
                          </label>

                          {/* Hex text input */}
                          <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-md px-2 py-1 ml-auto">
                            <span className="w-2.5 h-2.5 rounded-full border border-gray-700" style={{ backgroundColor: patternColor }} />
                            <input
                              type="text"
                              value={patternColor}
                              onChange={(e) => setPatternColor(e.target.value)}
                              placeholder="#ffffff"
                              className="w-20 bg-transparent text-xs text-gray-200 font-mono focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SHARED STYLING (USED BY BOTH WEB BENTO & API) */}
            <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
              <button onClick={() => toggleSection('bento')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                <span className="text-sm font-semibold text-gray-300">{mode === 'web' ? 'Bento Styling' : 'Window Styling'}</span>
                {expanded.bento ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
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

                  {/* Bento Alignment Mode (Web Bento Only) */}
                  {mode === 'web' && (
                    <div className="space-y-1.5 pt-2 border-t border-gray-800">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-medium text-gray-300">Bento Grid Flow</label>
                        <span className="text-[10px] text-gray-500">
                          {bentoAlignment === 'center' ? 'Centered Infinite' : bentoAlignment === 'left' ? 'Left-Aligned Hero' : 'Right-Aligned Hero'}
                        </span>
                      </div>
                      <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                        <button
                          type="button"
                          onClick={() => setBentoAlignment('left')}
                          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                            bentoAlignment === 'left'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          Left Edge
                        </button>
                        <button
                          type="button"
                          onClick={() => setBentoAlignment('center')}
                          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                            bentoAlignment === 'center'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          Centered
                        </button>
                        <button
                          type="button"
                          onClick={() => setBentoAlignment('right')}
                          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                            bentoAlignment === 'right'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          Right Edge
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-tight">
                        {bentoAlignment === 'center' && 'Screenshot hero is in the center with cards expanding evenly outward.'}
                        {bentoAlignment === 'left' && 'Screenshot hero is anchored at the left boundary. Cards cascade only to the right, leaving the left open.'}
                        {bentoAlignment === 'right' && 'Screenshot hero is anchored at the right boundary with no cards beyond it, leaving the right open.'}
                      </p>
                    </div>
                  )}

                  {/* Layout Placement / Position Presets */}
                  <div className="space-y-2 pt-2 border-t border-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-300">{mode === 'web' ? 'Bento Placement' : 'Window Placement'}</span>
                      {(bentoXOffset !== 0 || bentoYOffset !== 0) && (
                        <button
                          type="button"
                          onClick={() => { setBentoXOffset(0); setBentoYOffset(0); }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                        >
                          center reset
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: 'Left', x: -25, y: 0 },
                        { label: 'Center', x: 0, y: 0 },
                        { label: 'Right', x: 25, y: 0 },
                        { label: 'Top Left', x: -25, y: -20 },
                        { label: 'Top', x: 0, y: -20 },
                        { label: 'Top Right', x: 25, y: -20 },
                        { label: 'Bottom Left', x: -25, y: 20 },
                        { label: 'Bottom', x: 0, y: 20 },
                        { label: 'Bottom Right', x: 25, y: 20 },
                      ].map((pos) => (
                        <button
                          key={pos.label}
                          type="button"
                          onClick={() => {
                            setBentoXOffset(pos.x);
                            setBentoYOffset(pos.y);
                          }}
                          className={`py-1.5 px-1.5 rounded-md text-[11px] font-medium transition-all ${
                            bentoXOffset === pos.x && bentoYOffset === pos.y
                              ? 'bg-blue-600 text-white shadow'
                              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom X Slider */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Horizontal (X) Offset</span>
                        <span>{bentoXOffset > 0 ? `+${bentoXOffset}%` : `${bentoXOffset}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        step="1"
                        value={bentoXOffset}
                        onChange={(e) => setBentoXOffset(parseInt(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    {/* Custom Y Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Vertical (Y) Offset</span>
                        <span>{bentoYOffset > 0 ? `+${bentoYOffset}%` : `${bentoYOffset}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        step="1"
                        value={bentoYOffset}
                        onChange={(e) => setBentoYOffset(parseInt(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>
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

            {/* BRANDING WATERMARK */}
            <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden">
              <button onClick={() => toggleSection('branding')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-400" />
                  Branding
                  {brandingEnabled && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </span>
                {expanded.branding ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {expanded.branding && (
                <div className="p-4 space-y-4 border-t border-gray-800">
                  {/* Toggle */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-gray-200">Watermark</p>
                      <p className="text-[11px] text-gray-500">crafted by · Weddsite</p>
                    </div>
                    <div
                      onClick={() => setBrandingEnabled(v => !v)}
                      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                        brandingEnabled ? 'bg-purple-600' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          brandingEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </label>

                  {brandingEnabled && (
                    <>
                      {/* Position Preset 9-grid */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-400">Position Preset</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'top-left',     label: 'Top Left'     },
                            { id: 'top',          label: 'Top Center'   },
                            { id: 'top-right',    label: 'Top Right'    },
                            { id: 'left',         label: 'Left Edge'    },
                            { id: 'center',       label: 'Center'       },
                            { id: 'right',        label: 'Right Edge'   },
                            { id: 'bottom-left',  label: 'Bottom Left'  },
                            { id: 'bottom',       label: 'Bottom Ctr'   },
                            { id: 'bottom-right', label: 'Bottom Right' },
                          ].map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setBrandingPosition(p.id as any);
                                setBrandingXOffset(0);
                                setBrandingYOffset(0);
                              }}
                              className={`py-1.5 px-1 rounded-md text-[11px] font-medium transition-all ${
                                brandingPosition === p.id && brandingXOffset === 0 && brandingYOffset === 0
                                  ? 'bg-purple-600 text-white shadow'
                                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Scale */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Scale</span>
                          <span>{Math.round(brandingScale * 100)}%</span>
                        </div>
                        <input
                          type="range" min="0.3" max="3.0" step="0.05"
                          value={brandingScale}
                          onChange={(e) => setBrandingScale(parseFloat(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                      </div>

                      {/* Rotation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Rotation</span>
                          <span className="flex items-center gap-1.5">
                            {brandingRotation !== 0 && (
                              <button type="button" onClick={() => setBrandingRotation(0)}
                                className="text-[10px] text-purple-400 hover:text-purple-300 underline">reset</button>
                            )}
                            <span>{brandingRotation}°</span>
                          </span>
                        </div>
                        <input
                          type="range" min="-180" max="180" step="1"
                          value={brandingRotation}
                          onChange={(e) => setBrandingRotation(parseInt(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                      </div>

                      {/* X Offset */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Horizontal (X) Offset</span>
                          <span>{brandingXOffset > 0 ? `+${brandingXOffset}%` : `${brandingXOffset}%`}</span>
                        </div>
                        <input
                          type="range" min="-60" max="60" step="1"
                          value={brandingXOffset}
                          onChange={(e) => setBrandingXOffset(parseInt(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                      </div>

                      {/* Y Offset */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Vertical (Y) Offset</span>
                          <span>{brandingYOffset > 0 ? `+${brandingYOffset}%` : `${brandingYOffset}%`}</span>
                        </div>
                        <input
                          type="range" min="-60" max="60" step="1"
                          value={brandingYOffset}
                          onChange={(e) => setBrandingYOffset(parseInt(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                      </div>

                      {/* Color */}
                      <div className="space-y-2 pt-1 border-t border-gray-800">
                        <label className="block text-xs font-medium text-gray-400">Color</label>
                        <div className="flex items-center gap-2.5">
                          <button type="button" title="White" onClick={() => setBrandingColor('#ffffff')}
                            className={`w-7 h-7 rounded-full bg-white border border-gray-300 transition-all ${
                              brandingColor === '#ffffff' ? 'ring-2 ring-purple-500 scale-110 shadow' : 'opacity-80 hover:opacity-100 hover:scale-105'
                            }`} />
                          <button type="button" title="Black" onClick={() => setBrandingColor('#000000')}
                            className={`w-7 h-7 rounded-full bg-black border border-gray-600 transition-all ${
                              brandingColor === '#000000' ? 'ring-2 ring-purple-500 scale-110 shadow' : 'opacity-80 hover:opacity-100 hover:scale-105'
                            }`} />
                          <label title="Custom Color"
                            className={`relative w-7 h-7 rounded-full cursor-pointer flex items-center justify-center border transition-all ${
                              brandingColor !== '#ffffff' && brandingColor !== '#000000'
                                ? 'ring-2 ring-purple-500 scale-110 shadow border-purple-400'
                                : 'border-dashed border-gray-600 hover:border-gray-400 hover:scale-105 bg-gray-800/80'
                            }`}
                            style={{ backgroundColor: brandingColor !== '#ffffff' && brandingColor !== '#000000' ? brandingColor : undefined }}
                          >
                            <input type="color" value={brandingColor} onChange={(e) => setBrandingColor(e.target.value)} className="sr-only" />
                            <Pipette className={`w-3 h-3 ${brandingColor !== '#ffffff' && brandingColor !== '#000000' ? 'text-gray-900 drop-shadow-sm' : 'text-gray-400'}`} />
                          </label>
                          <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-md px-2 py-1 ml-auto">
                            <span className="w-2.5 h-2.5 rounded-full border border-gray-700" style={{ backgroundColor: brandingColor }} />
                            <input type="text" value={brandingColor} onChange={(e) => setBrandingColor(e.target.value)}
                              placeholder="#ffffff" className="w-20 bg-transparent text-xs text-gray-200 font-mono focus:outline-none" />
                          </div>
                        </div>
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Opacity</span>
                          <span>{brandingOpacity}%</span>
                        </div>
                        <input type="range" min="10" max="100" step="5"
                          value={brandingOpacity}
                          onChange={(e) => setBrandingOpacity(parseInt(e.target.value))}
                          className="w-full accent-purple-500" />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* CANVAS DIMENSIONS */}
            <div className="border border-gray-800 rounded-lg bg-gray-900/30 overflow-hidden mb-6">
              <button onClick={() => toggleSection('dimensions')} className="w-full p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors">
                <span className="text-sm font-semibold text-gray-300">Dimensions</span>
                {expanded.dimensions ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
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

import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Map as MapIcon, Box, AlertCircle, 
  ChevronRight, TrendingUp, Scan, 
  Image as ImageIcon, Upload, RefreshCw, AlertTriangle,
  Camera, Target, Layers, MapPin, 
  Database, CheckCircle2, MoreVertical, Bug,
  BarChart3, Activity, FileText, Search, Filter, XCircle,
  MousePointer2, Trash2, X, MoveDiagonal2
} from 'lucide-react';

// --- CONFIGURATION FROM DATA.YAML ---
const MODEL_CLASSES = [
  'bridge joint', 'crack', 'mold', 'peeling', 'potholes', 
  'road bleeding', 'rust', 'spalling', 'spalling expose rebar', 
  'staining', 'vegetation'
];

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};

const MapViewModule = () => {
    const bridgeAssets = [
      // --- KUCHING DIVISION ---
      { id: 'AST-441', name: 'Darul Hana S-Bridge', coords: [1.5604, 110.3440], status: 'Pending' },
      { id: 'AST-101', name: 'Satok Suspension Bridge', coords: [1.554417, 110.324667], status: 'Verified' },
      { id: 'AST-102', name: 'Tun Salahuddin Bridge', coords: [1.554972, 110.325167], status: 'Verified' },
      { id: 'AST-103', name: 'Tanah Puteh Bridge', coords: [1.5492, 110.3780], status: 'Verified' },
      { id: 'AST-104', name: 'Batu Kawa Bridge', coords: [1.5144, 110.2975], status: 'Analyzing' },
      
      // --- SAMARAHAN / SIMUNJAN ---
      { id: 'AST-992', name: 'Batang Sadong Bridge', coords: [1.4473, 110.6897], status: 'Verified' },
      { id: 'AST-201', name: 'Batang Samarahan Bridge', coords: [1.5342, 110.4910], status: 'Verified' },
      
      // --- SRI AMAN / BETONG ---
      { id: 'AST-301', name: 'Batang Lupar 1 Bridge (U/C)', coords: [1.5137, 110.9770], status: 'Analyzing' },
      { id: 'AST-302', name: 'Batang Saribas Bridge', coords: [1.5360, 111.2340], status: 'Verified' },
      
      // --- SIBU DIVISION ---
      { id: 'AST-103', name: 'Lanang Bridge', coords: [2.2439, 111.8326], status: 'Verified' },
      { id: 'AST-401', name: 'Durin Bridge', coords: [2.1585, 112.0125], status: 'Verified' },
      { id: 'AST-402', name: 'Batang Igan Bridge', coords: [2.3160, 111.8280], status: 'Verified' },
      { id: 'AST-403', name: 'Batang Lebaan Bridge', coords: [2.2950, 111.6250], status: 'Verified' },
      
      // --- BINTULU DIVISION ---
      { id: 'AST-502', name: 'Bintulu-Jepak Bridge', coords: [3.1764, 113.0333], status: 'Analyzing' },
      { id: 'AST-501', name: 'Batang Kemena Bridge', coords: [3.1610, 113.0640], status: 'Verified' },
      
      // --- MIRI DIVISION ---
      { id: 'AST-882', name: 'Miri-Baram Bridge', coords: [4.5822, 114.1130], status: 'Verified' },
      { id: 'AST-601', name: 'Pujut 7 Bridge', coords: [4.4320, 114.0210], status: 'Verified' },
      
      // --- LIMBANG / LAWAS ---
      { id: 'AST-701', name: 'Limbang Bridge', coords: [4.7520, 115.0110], status: 'Verified' },
      { id: 'AST-702', name: 'Lawas Bridge', coords: [4.8580, 115.4050], status: 'Verified' }
    ];

  return (
    <div className="h-full w-full min-h-[600px] rounded-none overflow-hidden border border-white/10 bg-[#0c0e14] relative shadow-2xl">
      <MapContainer 
        center={[2.5, 113.0]} 
        zoom={7} 
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
        className="z-0"
      >
        <MapResizer />
        <ZoomControl position="bottomright" />

        <LayersControl position="topright">
          {/* 1. Standard Dark View (Default) */}
          <LayersControl.BaseLayer checked name="Dark View">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CartoDB'
            />
          </LayersControl.BaseLayer>

          {/* 2. Satellite View */}
          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri'
            />
          </LayersControl.BaseLayer>

          {/* 3. Terrain / Outdoor View */}
          <LayersControl.BaseLayer name="Terrain View">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenTopoMap'
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
      {bridgeAssets.map((bridge) => (
        <Marker key={bridge.id} position={bridge.coords as [number, number]}>
          <Popup minWidth={150}>
            <div className="p-1 select-none">
              {/* Bridge ID */}
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter mb-0.5">
                {bridge.id}
              </p>
              
              {/* Bridge Name - Ensure this color is explicit */}
              <h3 className="font-bold text-white text-sm leading-tight mb-2">
                {bridge.name}
              </h3>
              
              {/* Status Tag */}
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                  bridge.status === 'Verified' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {bridge.status}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      </MapContainer>

      {/* Aesthetic Overlay */}
      <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-white font-black text-xs uppercase tracking-widest italic">Live Geospatial Feed</h3>
          </div>
          <p className="text-slate-500 text-[10px] mt-1 font-bold">Region: Sarawak, Malaysia</p>
        </div>
      </div>
    </div>
  );
};


const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [manualDetections, setManualDetections] = useState([]);
  const [resizingId, setResizingId] = useState(null); // Track which box is being resized
  const [assets, setAssets] = useState([
    { id: 'AST-992', name: 'Batang Sadong Bridge.jpg', date: '2026-04-10', status: 'Verified' },
    { id: 'AST-441', name: 'Darul Hana S-Bridge.png', date: '2026-04-12', status: 'Pending' }
  ]);

  const fileInputRef = useRef(null);
  const imageContainerRef = useRef(null);

  // --- AI INFERENCE ---
  const runInference = async (file) => {
    setIsAnalyzing(true);
    try {
      // Create FormData and append the actual file object
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/analyze', { 
        method: 'POST', 
        body: formData // Now formData is defined
      });
      
      if (!response.ok) throw new Error('Backend unreachabe');
      
      const data = await response.json();
      setAnalysisResults(data); 
      console.log("AI Response:", data);
    } catch (e) {
      console.error("Inference Error:", e);
      // Reset results on error to avoid showing stale data
      setAnalysisResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setUploadedImage(event.target.result);
      reader.readAsDataURL(file);
      
      const newId = `AST-${Math.floor(Math.random() * 900 + 100)}`;
      setAssets(prev => [{ 
        id: newId, 
        name: file.name, 
        date: new Date().toISOString().split('T')[0], 
        status: 'Analyzing' 
      }, ...prev]);
      
      setActiveTab('analysis');
      runInference(file);
    }
  };

  // --- RESIZING HANDLER ---
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!resizingId || !imageContainerRef.current) return;

      const rect = imageContainerRef.current.getBoundingClientRect();
      // Calculate coordinates normalized to the 640x640 space used by the model
      const currentX = ((e.clientX - rect.left) / rect.width) * 640;
      const currentY = ((e.clientY - rect.top) / rect.height) * 640;

      setManualDetections(prev => prev.map(det => {
         if (det.id === resizingId) {
          // Update the bottom-right coordinates (x2, y2)
          // We enforce a minimum size of 10x10 to prevent inversion
          const x2 = Math.max(det.bbox[0] + 10, currentX);
          const y2 = Math.max(det.bbox[1] + 10, currentY);
          return { ...det, bbox: [det.bbox[0], det.bbox[1], x2, y2] };
        }
        return det;
      }));
    };

    const handleGlobalMouseUp = () => {
      setResizingId(null);
    };

    if (resizingId) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [resizingId]);

  // --- MANUAL TAGGING LOGIC ---
  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Calculate relative position (0 to 1)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const newTag = {
      id: `manual-${Date.now()}`,
      type: 'crack', 
      confidence: 1.0,
      bbox: [x - 0.05, y - 0.05, x + 0.05, y + 0.05], // Normalized
      isManual: true
    };
    setManualDetections(prev => [...prev, newTag]);
  };

  const removeDetection = (e, id, isManual) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (isManual) {
      setManualDetections(prev => prev.filter(d => d.id !== id));
    } else {
      setAnalysisResults(prev => ({
        ...prev,
        all_detections: prev.all_detections?.filter((_, idx) => idx !== id) || []
      }));
    }
  };

  const updateTagType = (id, newType) => {
    setManualDetections(prev => prev.map(d => d.id === id ? { ...d, type: newType } : d));
  };

  const combinedDetections = useMemo(() => {
    const ai = analysisResults?.all_detections?.map((d, i) => ({ ...d, id: i, isManual: false })) || [];
    return [...ai, ...manualDetections];
  }, [analysisResults, manualDetections]);

  // --- MODULES ---
const DashboardModule = () => {
  const totalDetections = combinedDetections.length;

  const systemResponseTime = 120; 

  const resolvedPercentage = totalDetections > 0
    ? Math.min(100, Math.round((manualDetections.length / totalDetections) * 100))
    : 0;

  const weeklyData = useMemo(() => {
    return [5, 8, 6, 10, 7, 12, 9];
  }, []);

  // ✅ FIX: prevent divide-by-zero
  const maxVal = Math.max(...weeklyData, 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Detection</p>
          <p className="text-2xl font-black text-white">{totalDetections}</p>
        </div>

        <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">System Response Time</p>
          <p className="text-2xl font-black text-white">{systemResponseTime} ms</p>
        </div>

        <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Resolved</p>
          <p className="text-2xl font-black text-emerald-400">{resolvedPercentage}%</p>
        </div>

        <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Weekly Detection</p>
          <p className="text-2xl font-black text-white">{weeklyData.reduce((a,b)=>a+b,0)}</p>
        </div>
      </div>

      {/* WEEKLY GRAPH */}
      <div className="bg-[#0c0e14] border border-white/5 p-8 rounded-[3rem]">
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">
          Weekly Detection Trend
        </h3>

        <div className="h-48 flex items-end gap-3 px-2">
          {weeklyData.map((value, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              {/* bar */}
              <div
                className="w-full bg-indigo-500 rounded-t-xl transition-all duration-700"
                style={{
                  height: `${(value / maxVal) * 100}%`,
                  minHeight: value > 0 ? '6px' : '0px'
                }}
              />

              {/* label */}
              <span className="text-[9px] text-slate-500 text-center mt-2 font-bold">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

  const AnalysisModule = () => {
    const frequencyData = useMemo(() => {
      const counts = {};
      MODEL_CLASSES.forEach(c => counts[c] = 0);
      combinedDetections.forEach(d => { if(counts[d.type] !== undefined) counts[d.type]++ });
      return counts;
    }, [combinedDetections]);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-in slide-in-from-bottom-4 duration-700">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center px-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manual Tag</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-3">
              <span className="flex items-center gap-1"><MousePointer2 size={12} className="text-indigo-400" /> Tag</span>
              <span className="flex items-center gap-1"><MoveDiagonal2 size={12} className="text-amber-400" /> Resize</span>
              <span className="flex items-center gap-1"><X size={12} className="text-rose-400" /> Remove</span>
            </p>
          </div>

          <div 
            ref={imageContainerRef}
            onClick={handleImageClick}
            className="bg-black rounded-[3rem] border border-white/10 overflow-hidden relative aspect-video flex items-center justify-center ring-1 ring-white/5 group shadow-2xl cursor-crosshair select-none"
          >
            {uploadedImage ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden pointer-events-none">
                <img 
                  src={uploadedImage} 
                  alt="Bridge Scan" 
                  className="max-w-full max-h-full object-contain select-none" 
                  id="target-image"
                />
                
                <div className="absolute inset-0 pointer-events-auto">
                  {!isAnalyzing && combinedDetections.map((det) => (
                    <div 
                      key={det.id}
                      onContextMenu={(e) => removeDetection(e, det.id, det.isManual)}
                      className={`absolute border-2 transition-colors ${
                        det.isManual ? 'border-amber-400 bg-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'border-indigo-400 bg-indigo-500/10'
                      } group/tag animate-in fade-in zoom-in-95 duration-200`}
                      style={{
                        left: `${det.bbox[0] * 100}%`,
                        top: `${det.bbox[1] * 100}%`,
                        width: `${(det.bbox[2] - det.bbox[0]) * 100}%`,
                        height: `${(det.bbox[3] - det.bbox[1]) * 100}%`,
                      }}
                    >
                      {/* Tag Label with Delete Button */}
                      <div className={`absolute -top-7 left-0 h-6 flex items-center rounded-sm text-[9px] font-black uppercase whitespace-nowrap z-30 shadow-xl overflow-hidden ${
                        det.isManual ? 'bg-amber-500 text-black' : 'bg-indigo-600 text-white'
                      }`}>
                        <div className="px-2">
                          {det.isManual ? (
                            <select 
                              className="bg-transparent border-none outline-none font-black cursor-pointer"
                              value={det.type}
                              onChange={(e) => updateTagType(det.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {MODEL_CLASSES.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                            </select>
                          ) : (
                            `${det.type} • ${Math.round(det.confidence * 100)}%`
                          )}
                        </div>
                        
                        <button 
                          onClick={(e) => removeDetection(e, det.id, det.isManual)}
                          className={`h-full aspect-square flex items-center justify-center border-l transition-colors ${
                            det.isManual ? 'border-black/10 hover:bg-black/20' : 'border-white/10 hover:bg-white/20'
                          }`}
                        >
                          <X size={10} strokeWidth={4} />
                        </button>
                      </div>

                      {/* RESIZE HANDLE - Only for Manual Tags */}
                      {det.isManual && (
                        <div 
                          className="absolute -right-1 -bottom-1 w-4 h-4 cursor-nwse-resize z-40 flex items-center justify-center group-hover/tag:scale-125 transition-transform"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setResizingId(det.id);
                          }}
                        >
                          <div className="w-2 h-2 bg-amber-400 rounded-full border border-black/20 shadow-sm" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-20">
                    <RefreshCw size={40} className="text-indigo-500 animate-spin mb-4" />
                    <p className="text-xs font-black tracking-widest text-white uppercase italic">Processing Local Engine...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center opacity-30 hover:opacity-100 transition-all cursor-pointer">
                 <Camera size={48} className="text-indigo-500 mx-auto mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em]">Ready for input</p>
              </div>
            )}
          </div>

          <div className="bg-[#0c0e14] border border-white/5 p-8 rounded-[3rem]">
            <h4 className="text-[10px] font-black uppercase text-slate-500 mb-6 tracking-widest flex items-center gap-2">
              <BarChart3 size={14} className="text-indigo-500" /> Damage Summary
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
               {MODEL_CLASSES.map(cls => (
                 <div key={cls} className={`flex items-center gap-4 ${frequencyData[cls] > 0 ? 'opacity-100' : 'opacity-20'}`}>
                    <span className="w-24 text-[9px] font-black uppercase text-slate-400 truncate">{cls}</span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(frequencyData[cls] / 10) * 100}%` }} />
                    </div>
                    <span className="w-4 text-[9px] font-black text-indigo-400 text-right">{frequencyData[cls]}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-[#0c0e14] border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">Verification Audit</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase text-slate-500">AI Results</span>
                  <span className="text-white font-black text-xl">{analysisResults?.all_detections?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase text-slate-500">Human Corrected</span>
                  <span className="text-amber-500 font-black text-xl">+{manualDetections.length}</span>
                </div>
                <div className="pt-4">
                  <p className="text-[10px] font-black uppercase text-white tracking-widest mb-2 opacity-50 text-center">Verified Anomalies</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-white text-7xl font-black italic tracking-tighter leading-none">
                        {combinedDetections.length}
                    </span>
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-[9px] font-mono text-slate-600 leading-tight">
                STATUS: SYNCED<br/>
                UPLINK: ACTIVE
              </p>
            </div>
          </div>

          <button className="w-full py-6 bg-white text-black font-black uppercase tracking-widest text-[10px] italic rounded-[2rem] hover:bg-indigo-500 hover:text-white transition-all shadow-xl group flex items-center justify-center gap-2">
            Export Dataset (COCO) <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  const AssetsModule = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {assets.map((asset) => (
        <div key={asset.id} className="bg-[#0c0e14] border border-white/5 p-5 rounded-[2.5rem] group hover:ring-2 ring-indigo-500/20 transition-all">
          <div className="aspect-[4/3] bg-black rounded-3xl mb-4 flex items-center justify-center border border-white/5">
             <ImageIcon size={32} className="text-slate-800" />
          </div>
          <p className="text-white font-bold text-sm truncate">{asset.name}</p>
          <div className="flex justify-between items-center mt-2">
             <span className="text-[10px] font-mono text-slate-500">{asset.id}</span>
             <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-black uppercase">{asset.status}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const DefectsModule = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {MODEL_CLASSES.map((cls, i) => (
        <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl group hover:bg-white/[0.08] transition-all flex justify-between items-center">
          <div>
            <p className="text-[9px] font-mono text-indigo-500 mb-1">DATASET_ID_0{i}</p>
            <p className="text-sm font-black text-white uppercase tracking-tight">{cls}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-indigo-400 transition-colors">
            <ChevronRight size={18} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#05060a] text-slate-300 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-[#080a0f] z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Scan size={22} className="text-white" />
            </div>
            <h1 className="text-white font-black tracking-tighter text-xl italic leading-none">HOVERSCAN</h1>
          </div>
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'map', icon: MapIcon, label: 'Map View' },
              { id: 'assets', icon: Database, label: 'Asset Hub' },
              { id: 'defects', icon: AlertTriangle, label: 'Defect Classes' },
              { id: 'analysis', icon: BarChart3, label: 'AI Analysis' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#080a0f]/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">System</span>
            <ChevronRight size={14} className="text-slate-700" />
            <h2 className="text-white font-bold text-sm uppercase tracking-widest italic">{activeTab}</h2>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">
            Upload Image
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'dashboard' && <DashboardModule />}
          {activeTab === 'map' && <MapViewModule />}
          {activeTab === 'assets' && <AssetsModule />}
          {activeTab === 'defects' && <DefectsModule />}
          {activeTab === 'analysis' && <AnalysisModule />}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #0c0e14 !important;
          color: #94a3b8 !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default App;
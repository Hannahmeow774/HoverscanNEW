import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Map as MapIcon, Box, AlertCircle, 
  ChevronRight, TrendingUp, Scan, 
  Image as ImageIcon, Upload, RefreshCw, AlertTriangle,
  Camera, Target, Layers, MapPin, 
  Database, CheckCircle2, MoreVertical, Bug,
  BarChart3, Activity, FileText, Search, Filter, XCircle,
  MousePointer2, Trash2, X
} from 'lucide-react';

// --- CONFIGURATION FROM DATA.YAML ---
const MODEL_CLASSES = [
  'bridge joint', 'crack', 'mold', 'peeling', 'potholes', 
  'road bleeding', 'rust', 'spalling', 'spalling expose rebar', 
  'staining', 'vegetation'
];

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [manualDetections, setManualDetections] = useState([]);
  const [assets, setAssets] = useState([
    { id: 'AST-992', name: 'Batang Sadong Bridge.jpg', date: '2026-04-10', status: 'Verified' },
    { id: 'AST-441', name: 'Darul Hana S-Bridge.png', date: '2026-04-12', status: 'Pending' }
  ]);

  const fileInputRef = useRef(null);
  const imageContainerRef = useRef(null);

  // --- AI INFERENCE ---
  const runInference = async (file) => {
    setIsAnalyzing(true);
    setAnalysisResults(null);
    setManualDetections([]); 
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/analyze', { 
        method: 'POST', 
        body: formData 
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setAnalysisResults(data);
    } catch (e) {
      console.error("Inference Error:", e);
      setAnalysisResults({ error: "Local engine offline. Start main.py on port 8000." });
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

  // --- MANUAL TAGGING LOGIC ---
  const handleImageClick = (e) => {
    if (!uploadedImage || isAnalyzing) return;
    
    // Calculate 640x640 normalized coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 640;
    const y = ((e.clientY - rect.top) / rect.height) * 640;

    const newTag = {
      id: `manual-${Date.now()}`,
      type: 'crack', // Default manual tag
      confidence: 1.0,
      bbox: [x - 30, y - 30, x + 30, y + 30],
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
        all_detections: prev.all_detections.filter((_, idx) => idx !== id)
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
  const DashboardModule = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Health Score', val: '92.1%', icon: Activity, color: 'text-emerald-500' },
          { label: 'Total Assets', val: assets.length, icon: Database, color: 'text-indigo-500' },
          { label: 'Verified Issues', val: combinedDetections.length.toString().padStart(2, '0'), icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'AI Accuracy', val: '91.4%', icon: Target, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:bg-white/[0.08] transition-all">
            <stat.icon size={20} className={`${stat.color} mb-4`} />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</h3>
            <p className="text-2xl font-black text-white">{stat.val}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0c0e14] border border-white/5 p-8 rounded-[3rem]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Detection Trends (Weekly)</h3>
            <TrendingUp size={18} className="text-indigo-500" />
          </div>
          <div className="h-48 flex items-end gap-3 px-2">
            {[30, 45, 35, 70, 50, 65, 85, 60, 75, 40].map((h, i) => (
              <div key={i} className="flex-1 bg-white/5 rounded-t-xl relative group overflow-hidden">
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-700" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl shadow-indigo-600/20">
          <div>
            <h3 className="font-black text-xl leading-tight mb-2 italic uppercase">Smart<br/>Correction</h3>
            <p className="text-xs opacity-70 leading-relaxed">Click to tag missed defects. Click 'X' or Right-Click on any tag to remove accidental entries.</p>
          </div>
          <button onClick={() => setActiveTab('analysis')} className="w-full bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Launch Analysis
          </button>
        </div>
      </div>
    </div>
  );

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
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <MousePointer2 size={12} className="text-indigo-400" /> Click image to tag • Click 'X' to remove
            </p>
          </div>

          <div 
            ref={imageContainerRef}
            onClick={handleImageClick}
            className="bg-black rounded-[3rem] border border-white/10 overflow-hidden relative aspect-video flex items-center justify-center ring-1 ring-white/5 group shadow-2xl cursor-crosshair"
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
                      className={`absolute border-2 transition-all ${
                        det.isManual ? 'border-amber-400 bg-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'border-indigo-400 bg-indigo-500/10'
                      } group/tag animate-in fade-in zoom-in-95 duration-200`}
                      style={{
                        left: `${(det.bbox[0] / 640) * 100}%`,
                        top: `${(det.bbox[1] / 640) * 100}%`,
                        width: `${((det.bbox[2] - det.bbox[0]) / 640) * 100}%`,
                        height: `${((det.bbox[3] - det.bbox[1]) / 640) * 100}%`,
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
                        
                        {/* THE NEW REMOVE BUTTON */}
                        <button 
                          onClick={(e) => removeDetection(e, det.id, det.isManual)}
                          className={`h-full aspect-square flex items-center justify-center border-l transition-colors ${
                            det.isManual ? 'border-black/10 hover:bg-black/20' : 'border-white/10 hover:bg-white/20'
                          }`}
                          title="Remove this tag"
                        >
                          <X size={10} strokeWidth={4} />
                        </button>
                      </div>
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

          {/* Chart Module */}
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

        {/* Audit Sidebar */}
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

  // --- REUSABLE PLACEHOLDERS ---
  const MapViewModule = () => (
    <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-[3rem] bg-white/5">
      <div className="text-center">
        <MapIcon size={40} className="text-indigo-500 mx-auto mb-4" />
        <p className="text-xs font-black uppercase tracking-widest opacity-40 italic">Geospatial data offline</p>
      </div>
    </div>
  );

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
              { id: 'defects', icon: AlertTriangle, label: 'Model Classes' },
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
        <div className="mt-auto p-8">
           <div className="bg-indigo-900/10 border border-indigo-500/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Local Link</span>
              </div>
              <p className="text-[10px] text-slate-600 font-bold">READY TO VERIFY</p>
           </div>
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
      `}</style>
    </div>
  );
};

export default App;
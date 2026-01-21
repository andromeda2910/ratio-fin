import React, { useState, useEffect, useRef } from 'react';
import { Info, Calculator, TrendingUp, X, AlertCircle, Plus, Minus, CheckCircle2, AlertTriangle, User, RotateCcw } from 'lucide-react';
import { calculateRatios, getStatus, formatRibuan, getInsight } from './calculations';

const InfoTooltip = ({ info }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center" ref={tooltipRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-300 hover:text-blue-500 transition-colors focus:outline-none"
      >
        <Info size={14} />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-slate-800 text-white text-[10px] rounded-xl shadow-2xl z-100 leading-relaxed border border-slate-700 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          {info}
          <div className="absolute top-full left-2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, info, value, onChange, type = "text", error, isYear = false, placeholder }) => (
  <div className="flex flex-col gap-1.5 mb-5 group">
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <InfoTooltip info={info} />
    </div>
    
    <div className="relative flex items-center">
      {isYear && (
        <button 
          onClick={() => onChange(String(Number(value) - 1))}
          className="absolute left-2 p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all z-10"
        >
          <Minus size={16} />
        </button>
      )}
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-4 ${isYear ? 'text-center px-10' : ''} border-2 ${error ? 'border-red-100 bg-red-50/50' : 'border-slate-100 bg-slate-50/50'} rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 transition-all text-sm md:text-base`}
        placeholder={placeholder || (isYear ? "2026" : "0")}
      />

      {isYear && (
        <button 
          onClick={() => onChange(String(Number(value) + 1))}
          className="absolute right-2 p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all z-10"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
    {error && (
      <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 animate-in slide-in-from-left-2">
        <AlertCircle size={10}/> {error}
      </span>
    )}
  </div>
);

export default function App() {
  const [formData, setFormData] = useState({
    namaPT: '', tahun: '2026', labaBersih: '', asetLancar: '', utangLancar: '', pendapatan: '', totalEkuitas: ''
  });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleReset = () => {
    setFormData({ namaPT: '', tahun: '2026', labaBersih: '', asetLancar: '', utangLancar: '', pendapatan: '', totalEkuitas: '' });
    setErrors({});
    setResults(null);
  };

  const handleInputChange = (field, val) => {
    const formatted = (field === 'namaPT' || field === 'tahun') ? val : formatRibuan(val);
    setFormData({ ...formData, [field]: formatted });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    let newErrors = {};
    const fields = ['namaPT', 'labaBersih', 'asetLancar', 'utangLancar', 'pendapatan', 'totalEkuitas'];
    fields.forEach(f => { if (!formData[f]) newErrors[f] = "Wajib diisi"; });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 md:py-12 px-4 font-sans selection:bg-blue-100">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Calculator size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight">RatioFin</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Financial Analyzer</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Input Data</h2>
            <button 
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest border border-transparent hover:border-red-100"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="md:col-span-2">
              <InputField label="Nama Perusahaan" info="Nama entitas bisnis yang dianalisis." value={formData.namaPT} onChange={(v) => handleInputChange('namaPT', v)} error={errors.namaPT} placeholder="PT Contoh Indonesia" />
            </div>
            <InputField label="Tahun" isYear={true} info="Tahun periode laporan." value={formData.tahun} onChange={(v) => handleInputChange('tahun', v)} />
            <InputField label="Laba Bersih (dalam Rp.)" info="Keuntungan bersih setelah pajak." value={formData.labaBersih} onChange={(v) => handleInputChange('labaBersih', v)} error={errors.labaBersih} />
            <InputField label="Aset Lancar (dalam Rp.)" info="Harta liquid (Kas, Bank, Piutang)." value={formData.asetLancar} onChange={(v) => handleInputChange('asetLancar', v)} error={errors.asetLancar} />
            <InputField label="Utang Lancar (dalam Rp.)" info="Kewajiban jangka pendek (< 1th)." value={formData.utangLancar} onChange={(v) => handleInputChange('utangLancar', v)} error={errors.utangLancar} />
            <InputField label="Pendapatan (dalam Rp.)" info="Total omzet penjualan." value={formData.pendapatan} onChange={(v) => handleInputChange('pendapatan', v)} error={errors.pendapatan} />
            <InputField label="Total Ekuitas (dalam Rp.)" info="Modal bersih pemilik." value={formData.totalEkuitas} onChange={(v) => handleInputChange('totalEkuitas', v)} error={errors.totalEkuitas} />
          </div>

          <button 
            onClick={() => { if(validate()) { setResults(calculateRatios(formData)); setShowModal(true); } }} 
            className="w-full py-4 md:py-5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl hover:scale-[1.01] active:scale-95 shadow-xl shadow-blue-100 mt-4 flex items-center justify-center gap-3 transition-all duration-300 tracking-wider text-xs md:text-sm"
          >
            <TrendingUp size={18} /> ANALISIS SEKARANG
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-100 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="bg-slate-900 p-6 md:p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-tight">Hasil Laporan</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{formData.namaPT} — {formData.tahun}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 md:p-8 space-y-4 bg-white max-h-[80vh] overflow-y-auto">
              <ResultRow 
    label="Current Ratio" 
    type="currentRatio" // GANTI desc JADI type
    value={results.currentRatio} 
    suffix="x" 
    status={getStatus('currentRatio', results.currentRatio)} 
  />
  <ResultRow 
    label="Net Profit Margin" 
    type="npm" // GANTI desc JADI type
    value={results.npm} 
    suffix="%" 
    status={getStatus('npm', results.npm)} 
  />
  <ResultRow 
    label="Return on Equity" 
    type="roe" // GANTI desc JADI type
    value={results.roe} 
    suffix="%" 
    status={getStatus('roe', results.roe)} 
  />
              
              <button onClick={() => setShowModal(false)} className="w-full py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all mt-2 border border-slate-100 uppercase text-[10px] tracking-widest">
                Tutup Analisis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ResultRow = ({ label, type, value, suffix, status }) => {
  const isPositive = status === 'Sehat' || status === 'Efisien' || status === 'Sangat Baik';
  
  // Ambil insight dinamis berdasarkan tipe rasio dan nilainya
  const insightText = getInsight(type, value);

  return (
    <div className="p-4 md:p-5 bg-white rounded-2xl border border-slate-100">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
            {value}<span className="text-base text-slate-400 ml-0.5">{suffix}</span>
          </p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
          {isPositive ? <CheckCircle2 size={10}/> : <AlertTriangle size={10}/>}
          {status}
        </div>
      </div>
      {/* Box Insight Dinamis */}
      <p className="text-[10px] text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
        <span className="font-bold text-blue-700">💡 Insight:</span> {insightText}
      </p>
    </div>
  );
};;
import React, { useState } from 'react';
import { Info, Calculator, TrendingUp, X, AlertCircle, Plus, Minus, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { calculateRatios, getStatus, formatRibuan } from './calculations';

const InputField = ({ label, info, value, onChange, type = "text", error, isYear = false }) => (
  <div className="flex flex-col gap-1.5 mb-5 group">
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-blue-600 transition-colors">
        {label}
      </label>
      <div className="group/info relative flex items-center">
        <Info size={14} className="text-slate-300 cursor-help hover:text-blue-500 transition-colors" />
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover/info:block w-60 p-3 bg-slate-800 text-white text-[10px] rounded-xl shadow-2xl z-50 leading-relaxed border border-slate-700 backdrop-blur-md">
          {info}
          <div className="absolute top-full left-2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
        </div>
      </div>
    </div>
    
    <div className="relative flex items-center">
      {isYear && (
        <button 
          onClick={() => onChange(String(Number(value) - 1))}
          className="absolute left-2 p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-600 transition-all z-10"
        >
          <Minus size={16} />
        </button>
      )}
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-4 ${isYear ? 'text-center px-10' : ''} border-2 ${error ? 'border-red-100 bg-red-50/50' : 'border-slate-100 bg-slate-50/50'} rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 transition-all placeholder:text-slate-300`}
        placeholder="0"
      />

      {isYear && (
        <button 
          onClick={() => onChange(String(Number(value) + 1))}
          className="absolute right-2 p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-600 transition-all z-10"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
    {error && (
      <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 animate-bounce">
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
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans selection:bg-blue-100 selection:text-blue-700">
      <div className="max-w-2xl mx-auto">
        
        {/* Profile Header (Biar Portofolio Keliatan Eksklusif) */}
        <div className="flex justify-between items-center mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Calculator size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">RatioFin <span className="text-blue-600">v1.0</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Analyzer</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-100 shadow-sm">
            <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center"><User size={12} className="text-slate-500" /></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase">Portfolio Mode</span>
          </div>
        </div>

        {/* Card Utama */}
        <div className="bg-white p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden">
          {/* Dekorasi Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="md:col-span-2">
              <InputField label="Nama Perusahaan" info="Nama PT yang akan dianalisis kesehatannya." value={formData.namaPT} onChange={(v) => handleInputChange('namaPT', v)} error={errors.namaPT} placeholder="PT Teknologi Masa Depan" />
            </div>
            <InputField label="Tahun Laporan" isYear={true} info="Periode akuntansi." value={formData.tahun} onChange={(v) => handleInputChange('tahun', v)} />
            <InputField label="Laba Bersih" info="Profit setelah pajak." value={formData.labaBersih} onChange={(v) => handleInputChange('labaBersih', v)} error={errors.labaBersih} />
            <InputField label="Aset Lancar" info="Harta liquid perusahaan." value={formData.asetLancar} onChange={(v) => handleInputChange('asetLancar', v)} error={errors.asetLancar} />
            <InputField label="Utang Lancar" info="Kewajiban jangka pendek." value={formData.utangLancar} onChange={(v) => handleInputChange('utangLancar', v)} error={errors.utangLancar} />
            <InputField label="Pendapatan" info="Omzet penjualan." value={formData.pendapatan} onChange={(v) => handleInputChange('pendapatan', v)} error={errors.pendapatan} />
            <InputField label="Total Ekuitas" info="Modal bersih pemilik." value={formData.totalEkuitas} onChange={(v) => handleInputChange('totalEkuitas', v)} error={errors.totalEkuitas} />
          </div>

          <button 
            onClick={() => { if(validate()) { setResults(calculateRatios(formData)); setShowModal(true); } }} 
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-200 mt-6 flex items-center justify-center gap-3 transition-all duration-300 tracking-wide text-sm"
          >
            <TrendingUp size={20} /> ANALISIS SEKARANG
          </button>
        </div>

        {/* Footer Portofolio */}
        <p className="text-center mt-12 text-slate-400 text-[11px] font-medium uppercase tracking-[0.2em]">
          Handcrafted by You • 2026
        </p>
      </div>

      {/* POP-UP MODAL (The Masterpiece) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-100 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Calculator size={120} /></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tight">Financial Scorecard</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{formData.namaPT || "Unnamed PT"} — {formData.tahun}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-5 bg-white">
              <ResultRow label="Current Ratio" desc="Likuiditas: Kemampuan bayar utang jangka pendek." value={results.currentRatio} suffix="x" status={getStatus('currentRatio', results.currentRatio)} />
              <ResultRow label="Net Profit Margin" desc="Profitabilitas: Efisiensi laba dari penjualan." value={results.npm} suffix="%" status={getStatus('npm', results.npm)} />
              <ResultRow label="Return on Equity" desc="Efisiensi: Pengembalian laba atas modal." value={results.roe} suffix="%" status={getStatus('roe', results.roe)} />
              
              <button onClick={() => setShowModal(false)} className="w-full py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all mt-4 border border-slate-100 uppercase text-xs tracking-widest">
                Tutup Laporan Analisis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ResultRow = ({ label, desc, value, suffix, status }) => {
  const isPositive = status === 'Sehat' || status === 'Efisien' || status === 'Sangat Baik';
  return (
    <div className="group p-5 bg-white rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}<span className="text-lg text-slate-400 ml-0.5">{suffix}</span></p>
        </div>
        <div className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tight shadow-sm ${isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
          {isPositive ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>}
          {status}
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
        {desc}
      </p>
    </div>
  );
};
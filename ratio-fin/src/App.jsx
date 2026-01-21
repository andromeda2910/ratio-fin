import React, { useState, useEffect, useRef } from 'react';
import { Info, Calculator, TrendingUp, X, AlertCircle, Plus, Minus, CheckCircle2, AlertTriangle, RotateCcw, Download } from 'lucide-react';
import { calculateRatios, getStatus, formatRibuan, getInsight, calculateHealthScore } from './calculations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InfoTooltip = ({ info }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => { if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative flex items-center" ref={tooltipRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-blue-500 focus:outline-none"><Info size={14} /></button>
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-slate-800 text-white text-[10px] rounded-xl shadow-2xl z-50 border border-slate-700 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          {info}<div className="absolute top-full left-2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, info, value, onChange, type = "text", error, isYear = false, placeholder }) => (
  <div className="flex flex-col gap-1.5 mb-5 group">
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <InfoTooltip info={info} />
    </div>
    <div className="relative flex items-center">
      {isYear && <button onClick={() => onChange(String(Number(value) - 1))} className="absolute left-2 p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all z-10"><Minus size={16} /></button>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full p-4 ${isYear ? 'text-center px-10' : ''} border-2 ${error ? 'border-red-100 bg-red-50/50' : 'border-slate-100 bg-slate-50/50'} rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 transition-all text-sm md:text-base`} placeholder={placeholder || (isYear ? "2026" : "0")} />
      {isYear && <button onClick={() => onChange(String(Number(value) + 1))} className="absolute right-2 p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all z-10"><Plus size={16} /></button>}
    </div>
    {error && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={10}/> {error}</span>}
  </div>
);

const ResultRow = ({ label, type, value, suffix, status }) => {
  const isPositive = status === 'Sehat' || status === 'Efisien' || status === 'Sangat Baik';
  return (
    <div className="p-4 md:p-5 bg-white rounded-2xl border border-slate-100">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{value}<span className="text-base text-slate-400 ml-0.5">{suffix}</span></p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
          {isPositive ? <CheckCircle2 size={10}/> : <AlertTriangle size={10}/>} {status}
        </div>
      </div>
      <p className="text-[10px] text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100/50"><span className="font-bold text-blue-700">💡 Insight:</span> {getInsight(type, value)}</p>
    </div>
  );
};

export default function App() {
  const [formData, setFormData] = useState({ namaPT: '', tahun: '2026', labaBersih: '', asetLancar: '', utangLancar: '', pendapatan: '', totalEkuitas: '' });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // FUNGSI PDF VERSI SUPER STABIL
 const downloadPDF = async () => {
    const reportElement = document.getElementById('report-to-print');
    if (!reportElement) return alert("Konten tidak ditemukan!");
    
    try {
      // Tunggu modal stabil
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const canvas = await html2canvas(reportElement, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff", // Paksa background putih standar
        // Abaikan warna oklch yang bikin crash
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('report-to-print');
          if (el) {
            // Paksa warna header agar tidak pakai oklch saat difoto
            el.querySelector('.bg-slate-900').style.backgroundColor = '#0f172a';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RatioFin_${formData.namaPT || 'Report'}.pdf`);
    } catch (err) { 
      console.error("PDF Error Detail:", err);
      alert("Gagal membuat PDF karena masalah format warna browser. Coba refresh sekali lagi!"); 
    }
  };

  const handleInputChange = (field, val) => {
    setFormData({ ...formData, [field]: (field === 'namaPT' || field === 'tahun') ? val : formatRibuan(val) });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    let newErrors = {};
    ['namaPT', 'labaBersih', 'asetLancar', 'utangLancar', 'pendapatan', 'totalEkuitas'].forEach(f => { if (!formData[f]) newErrors[f] = "Wajib"; });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 md:py-12 px-4 selection:bg-blue-100">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8 px-2">
          {/* PERBAIKAN CLASS GRADASI */}
          <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200"><Calculator size={20} /></div>
          <div><h1 className="text-lg font-black text-slate-800 tracking-tight">RatioFin</h1><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Financial Analyzer</p></div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-4xl shadow-xl border border-slate-50">
          <div className="flex justify-between items-center mb-8"><h2 className="text-xl font-black text-slate-800">Input Data</h2><button onClick={() => { setFormData({ namaPT: '', tahun: '2026', labaBersih: '', asetLancar: '', utangLancar: '', pendapatan: '', totalEkuitas: '' }); setResults(null); }} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase flex items-center gap-1"><RotateCcw size={12}/> Reset</button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="md:col-span-2"><InputField label="Nama Perusahaan" info="Nama bisnis." value={formData.namaPT} onChange={(v) => handleInputChange('namaPT', v)} error={errors.namaPT} placeholder="Contoh: PT Unilever Indonesia" /></div>
            <InputField label="Tahun" isYear={true} info="Tahun laporan." value={formData.tahun} onChange={(v) => handleInputChange('tahun', v)} />
            <InputField label="Laba Bersih (Rp.)" info="Laba bersih." value={formData.labaBersih} onChange={(v) => handleInputChange('labaBersih', v)} error={errors.labaBersih} />
            <InputField label="Aset Lancar (Rp.)" info="Harta liquid." value={formData.asetLancar} onChange={(v) => handleInputChange('asetLancar', v)} error={errors.asetLancar} />
            <InputField label="Utang Lancar (Rp.)" info="Kewajiban jangka pendek." value={formData.utangLancar} onChange={(v) => handleInputChange('utangLancar', v)} error={errors.utangLancar} />
            <InputField label="Pendapatan (Rp.)" info="Total omzet." value={formData.pendapatan} onChange={(v) => handleInputChange('pendapatan', v)} error={errors.pendapatan} />
            <InputField label="Total Ekuitas (Rp.)" info="Modal bersih." value={formData.totalEkuitas} onChange={(v) => handleInputChange('totalEkuitas', v)} error={errors.totalEkuitas} />
          </div>
          <button onClick={() => { if(validate()) { setResults(calculateRatios(formData)); setShowModal(true); } }} className="w-full py-5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 mt-4 flex items-center justify-center gap-3 uppercase text-xs"> <TrendingUp size={18} /> Analisis Sekarang </button>
        </div>
      </div>

      {showModal && results && (
        /* PERBAIKAN Z-INDEX */
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-100 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden my-auto">
            <div id="report-to-print" className="bg-white">
              <div className="bg-slate-900 p-6 md:p-8 text-white flex justify-between items-center">
                <div><h3 className="text-xl font-black tracking-tight">Hasil Laporan</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{formData.namaPT} — {formData.tahun}</p></div>
                <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-6 md:p-8 space-y-4">
                {(() => {
                  const scoreValue = calculateHealthScore(results);
                  const color = scoreValue >= 80 ? "text-emerald-500" : scoreValue >= 50 ? "text-amber-500" : "text-red-500";
                  return (
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center mb-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Skor Kesehatan Finansial</p>
                      <div className={`text-6xl font-black ${color}`}>{scoreValue}<span className="text-xl text-slate-300">/100</span></div>
                      <p className="text-[11px] text-slate-500 mt-2 px-4">{scoreValue >= 80 ? "🔥 Kondisi sangat prima!" : scoreValue >= 50 ? "⚠️ Kondisi cukup stabil." : "🚨 Perhatian khusus diperlukan!"}</p>
                    </div>
                  );
                })()}
                <ResultRow label="Current Ratio" type="currentRatio" value={results.currentRatio} suffix="x" status={getStatus('currentRatio', results.currentRatio)} />
                <ResultRow label="Net Profit Margin" type="npm" value={results.npm} suffix="%" status={getStatus('npm', results.npm)} />
                <ResultRow label="Return on Equity" type="roe" value={results.roe} suffix="%" status={getStatus('roe', results.roe)} />
              </div>
            </div>
            <div className="p-6 md:p-8 pt-0 space-y-3">
              <button onClick={downloadPDF} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"> <Download size={16} /> Download Laporan (PDF) </button>
              <button onClick={() => setShowModal(false)} className="w-full py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl border border-slate-100 uppercase text-[10px] tracking-widest">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
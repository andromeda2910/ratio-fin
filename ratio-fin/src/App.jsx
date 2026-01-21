import React, { useState, useEffect, useRef } from 'react';
import { 
  Info, Calculator, TrendingUp, X, AlertCircle, Plus, Minus, 
  CheckCircle2, AlertTriangle, RotateCcw, Download 
} from 'lucide-react';
import { 
  calculateRatios, getStatus, formatRibuan, getInsight, calculateHealthScore 
} from './calculations';
import html2pdf from 'html2pdf.js';

/* --- TOOLTIP COMPONENT --- */
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
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-blue-500 focus:outline-none"><Info size={14} /></button>
      {isOpen && (
        <div style={{ backgroundColor: '#1E293B', color: '#FFFFFF' }} className="absolute bottom-full left-0 mb-2 w-56 p-3 text-[10px] rounded-xl shadow-2xl z-50 border border-slate-700">
          {info}
        </div>
      )}
    </div>
  );
};

/* --- INPUT FIELD COMPONENT --- */
const InputField = ({ label, info, value, onChange, error, isYear = false }) => (
  <div className="flex flex-col gap-1.5 mb-5">
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <InfoTooltip info={info} />
    </div>
    <div className="relative flex items-center">
      {isYear && <button type="button" onClick={() => onChange(String(Number(value) - 1))} className="absolute left-2 p-2 text-slate-400 hover:text-blue-600 z-10"><Minus size={16} /></button>}
      <input 
        type="text" value={value} onChange={(e) => onChange(e.target.value)} 
        className={`w-full p-4 ${isYear ? 'text-center' : ''} border-2 ${error ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'} rounded-2xl outline-none focus:border-blue-500 focus:bg-white font-bold text-slate-700 transition-all text-sm`} 
      />
      {isYear && <button type="button" onClick={() => onChange(String(Number(value) + 1))} className="absolute right-2 p-2 text-slate-400 hover:text-blue-600 z-10"><Plus size={16} /></button>}
    </div>
    {error && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={10}/> {error}</span>}
  </div>
);

/* --- RESULT ROW (DIBERSIHKAN DARI OKLCH) --- */
const ResultRow = ({ label, type, value, suffix, status }) => {
  const isPositive = ['Sehat', 'Efisien', 'Sangat Baik'].includes(status);
  const bgColor = isPositive ? '#ECFDF5' : '#FFFBEB';
  const textColor = isPositive ? '#059669' : '#D97706';
  const borderColor = isPositive ? '#D1FAE5' : '#FEF3C7';
  
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderColor: '#F1F5F9' }} className="p-4 rounded-2xl border mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p style={{ color: '#94A3B8' }} className="text-[9px] font-black uppercase tracking-widest mb-1">{label}</p>
          <p style={{ color: '#0F172A' }} className="text-2xl font-black tracking-tighter">{value}<span style={{ color: '#94A3B8' }} className="text-base ml-0.5">{suffix}</span></p>
        </div>
        <div style={{ backgroundColor: bgColor, color: textColor, border: `1px solid ${borderColor}` }} className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1">
          {isPositive ? <CheckCircle2 size={10}/> : <AlertTriangle size={10}/>} {status}
        </div>
      </div>
      <p style={{ backgroundColor: '#F8FAFC', color: '#475569', border: '1px solid #F1F5F9' }} className="text-[10px] p-3 rounded-xl leading-relaxed">
        <span style={{ color: '#2563EB', fontWeight: '800' }}>💡 Insight:</span> {getInsight(type, value)}
      </p>
    </div>
  );
};

/* --- MAIN APP --- */
export default function App() {
  const [formData, setFormData] = useState({ namaPT: '', tahun: '2026', labaBersih: '', asetLancar: '', utangLancar: '', pendapatan: '', totalEkuitas: '' });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (field, val) => {
    const v = (field === 'namaPT' || field === 'tahun') ? val : formatRibuan(val);
    setFormData(prev => ({ ...prev, [field]: v }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    let newErrors = {};
    ['namaPT', 'labaBersih', 'asetLancar', 'utangLancar', 'pendapatan', 'totalEkuitas'].forEach(f => { if (!formData[f]) newErrors[f] = "Wajib diisi"; });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* --- FUNGSI DOWNLOAD SAKTI --- */
  const downloadPDF = () => {
    const element = document.getElementById('report-to-print');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `RatioFin_${formData.namaPT || 'Laporan'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#FFFFFF',
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div style={{ backgroundColor: '#2563EB' }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">RatioFin</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Health Analyzer</p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800">Input Data</h2>
            <button onClick={() => { setFormData({ namaPT: '', tahun: '2026', labaBersih: '', asetLancar: '', utangLancar: '', pendapatan: '', totalEkuitas: '' }); setResults(null); }} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase flex items-center gap-1 transition-colors"><RotateCcw size={12}/> Reset</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="md:col-span-2"><InputField label="Nama Perusahaan" info="Nama bisnis Anda" value={formData.namaPT} onChange={(v) => handleInputChange('namaPT', v)} error={errors.namaPT} /></div>
            <InputField label="Tahun" isYear info="Periode laporan" value={formData.tahun} onChange={(v) => handleInputChange('tahun', v)} />
            <InputField label="Laba Bersih" info="Keuntungan setelah pajak" value={formData.labaBersih} onChange={(v) => handleInputChange('labaBersih', v)} error={errors.labaBersih} />
            <InputField label="Aset Lancar" info="Kas, Bank, Piutang" value={formData.asetLancar} onChange={(v) => handleInputChange('asetLancar', v)} error={errors.asetLancar} />
            <InputField label="Utang Lancar" info="Kewajiban jangka pendek" value={formData.utangLancar} onChange={(v) => handleInputChange('utangLancar', v)} error={errors.utangLancar} />
            <InputField label="Pendapatan" info="Total omzet" value={formData.pendapatan} onChange={(v) => handleInputChange('pendapatan', v)} error={errors.pendapatan} />
            <InputField label="Total Ekuitas" info="Modal bersih pemilik" value={formData.totalEkuitas} onChange={(v) => handleInputChange('totalEkuitas', v)} error={errors.totalEkuitas} />
          </div>
          
          <button onClick={() => { if(validate()) { setResults(calculateRatios(formData)); setShowModal(true); } }} style={{ backgroundColor: '#2563EB' }} className="w-full py-5 text-white font-black rounded-2xl shadow-xl shadow-blue-100 mt-4 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"> <TrendingUp size={20} /> ANALISIS SEKARANG </button>
        </div>
      </div>

      {/* MODAL LAPORAN */}
      {showModal && results && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto">
            {/* AREA PDF (MENGGUNAKAN FULL HEX) */}
            <div id="report-to-print" style={{ backgroundColor: '#FFFFFF' }} className="p-0">
              <div style={{ backgroundColor: '#0F172A' }} className="p-8 text-white flex justify-between items-center">
                <div>
                  <h3 style={{ color: '#FFFFFF' }} className="text-2xl font-black">Laporan Finansial</h3>
                  <p style={{ color: '#94A3B8' }} className="text-[10px] font-bold uppercase tracking-widest mt-1">{formData.namaPT} — {formData.tahun}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20} /></button>
              </div>
              
              <div className="p-8">
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }} className="p-8 rounded-4xl text-center mb-8">
                  <p style={{ color: '#94A3B8' }} className="text-[10px] font-black uppercase tracking-widest mb-2">Health Score</p>
                  <div style={{ color: '#10B981' }} className="text-7xl font-black">
                    {calculateHealthScore(results)}<span style={{ color: '#CBD5E1' }} className="text-2xl">/100</span>
                  </div>
                </div>
                
                <ResultRow label="Likuiditas (Current Ratio)" type="currentRatio" value={results.currentRatio} suffix="x" status={getStatus('currentRatio', results.currentRatio)} />
                <ResultRow label="Profitabilitas (NPM)" type="npm" value={results.npm} suffix="%" status={getStatus('npm', results.npm)} />
                <ResultRow label="Efisiensi Modal (ROE)" type="roe" value={results.roe} suffix="%" status={getStatus('roe', results.roe)} />
              </div>
            </div>
            
            {/* Action Buttons (Tidak masuk PDF) */}
            <div className="p-8 pt-0 space-y-3">
              <button onClick={downloadPDF} style={{ backgroundColor: '#2563EB' }} className="w-full py-4 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all uppercase text-[11px] tracking-widest"> <Download size={18} /> Download PDF </button>
              <button onClick={() => setShowModal(false)} style={{ backgroundColor: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }} className="w-full py-4 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all"> Tutup </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
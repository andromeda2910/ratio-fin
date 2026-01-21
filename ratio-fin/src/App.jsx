import React, { useState, useEffect, useRef } from 'react';
import {
  Info,
  Calculator,
  TrendingUp,
  X,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download
} from 'lucide-react';

import {
  calculateRatios,
  getStatus,
  formatRibuan,
  getInsight,
  calculateHealthScore
} from './calculations';

import html2pdf from 'html2pdf.js';

/* =========================
   TOOLTIP
========================= */
const InfoTooltip = ({ info }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = e => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center">
      <button type="button" onClick={() => setOpen(!open)} className="text-slate-400 hover:text-blue-500 transition-colors">
        <Info size={14} />
      </button>
      {open && (
        <div
          style={{ backgroundColor: '#1E293B', color: '#FFFFFF' }}
          className="absolute bottom-full left-0 mb-2 w-56 p-3 rounded-xl text-[10px] shadow-2xl z-50 border border-slate-700"
        >
          {info}
          <div className="absolute top-full left-2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

/* =========================
   INPUT FIELD
========================= */
const InputField = ({ label, info, value, onChange, error, isYear }) => (
  <div className="mb-5 flex flex-col gap-1">
    <div className="flex items-center gap-2 mb-1">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <InfoTooltip info={info} />
    </div>

    <div className="relative">
      {isYear && (
        <button
          type="button"
          onClick={() => onChange(String(Number(value) - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors z-10"
        >
          <Minus size={16} />
        </button>
      )}

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full p-4 border-2 rounded-2xl font-bold text-sm outline-none transition-all ${
          error
            ? 'border-red-200 bg-red-50 focus:border-red-400'
            : 'border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white'
        } ${isYear ? 'text-center px-10' : ''}`}
        placeholder={isYear ? "2026" : "0"}
      />

      {isYear && (
        <button
          type="button"
          onClick={() => onChange(String(Number(value) + 1))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors z-10"
        >
          <Plus size={16} />
        </button>
      )}
    </div>

    {error && (
      <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

/* =========================
   RESULT ROW
========================= */
const ResultRow = ({ label, type, value, suffix, status }) => {
  const good = ['Sehat', 'Efisien', 'Sangat Baik'].includes(status);

  return (
    <div
      style={{ backgroundColor: '#FFFFFF', borderColor: '#F1F5F9' }}
      className="p-5 rounded-2xl border mb-4 shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[9px] uppercase text-slate-400 font-black tracking-widest mb-1">
            {label}
          </p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">
            {value}
            <span className="text-base text-slate-400 ml-1 font-bold">{suffix}</span>
          </p>
        </div>

        <div
          style={{
            backgroundColor: good ? '#ECFDF5' : '#FFFBEB',
            color: good ? '#059669' : '#D97706',
            border: `1px solid ${good ? '#D1FAE5' : '#FEF3C7'}`
          }}
          className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1"
        >
          {good ? <CheckCircle2 size={10}/> : <AlertTriangle size={10}/>}
          {status}
        </div>
      </div>

      <div
        style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
        className="p-3 rounded-xl border text-[10px] text-slate-600 leading-relaxed"
      >
        <b className="text-blue-700">💡 Insight:</b> {getInsight(type, value)}
      </div>
    </div>
  );
};

/* =========================
   MAIN APP
========================= */
export default function App() {
  const [formData, setFormData] = useState({
    namaPT: '',
    tahun: '2026',
    labaBersih: '',
    asetLancar: '',
    utangLancar: '',
    pendapatan: '',
    totalEkuitas: ''
  });

  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const validate = () => {
    let newErrors = {};
    const fields = ['namaPT', 'labaBersih', 'asetLancar', 'utangLancar', 'pendapatan', 'totalEkuitas'];
    fields.forEach(f => {
      if (!formData[f]) newErrors[f] = "Wajib diisi";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    const v = (field === 'namaPT' || field === 'tahun') ? value : formatRibuan(value);
    setFormData(p => ({ ...p, [field]: v }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
  };

  const downloadPDF = () => {
    const element = document.getElementById('report-to-print');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `RatioFin_${formData.namaPT || 'Laporan'}_${formData.tahun}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#FFFFFF'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div
            style={{ backgroundColor: '#2563EB' }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200"
          >
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">RatioFin</h1>
            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
              Financial Health Analyzer
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800">Data Keuangan</h2>
            <button 
              onClick={() => setFormData({ namaPT:'', tahun:'2026', labaBersih:'', asetLancar:'', utangLancar:'', pendapatan:'', totalEkuitas:'' })}
              className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12}/> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className="md:col-span-2">
              <InputField label="Nama Perusahaan" info="Nama bisnis Anda" value={formData.namaPT} onChange={v => handleInputChange('namaPT', v)} error={errors.namaPT} />
            </div>
            <InputField label="Tahun" isYear info="Periode laporan" value={formData.tahun} onChange={v => handleInputChange('tahun', v)} />
            <InputField label="Laba Bersih" info="Keuntungan bersih (EAT)" value={formData.labaBersih} onChange={v => handleInputChange('labaBersih', v)} error={errors.labaBersih} />
            <InputField label="Aset Lancar" info="Kas, Bank, Piutang, dll" value={formData.asetLancar} onChange={v => handleInputChange('asetLancar', v)} error={errors.asetLancar} />
            <InputField label="Utang Lancar" info="Kewajiban < 1 tahun" value={formData.utangLancar} onChange={v => handleInputChange('utangLancar', v)} error={errors.utangLancar} />
            <InputField label="Pendapatan" info="Total omzet penjualan" value={formData.pendapatan} onChange={v => handleInputChange('pendapatan', v)} error={errors.pendapatan} />
            <InputField label="Total Ekuitas" info="Modal bersih" value={formData.totalEkuitas} onChange={v => handleInputChange('totalEkuitas', v)} error={errors.totalEkuitas} />
          </div>

          <button
            onClick={() => {
              if (validate()) {
                setResults(calculateRatios(formData));
                setShowModal(true);
              }
            }}
            style={{ backgroundColor: '#2563EB' }}
            className="w-full py-5 text-white font-black rounded-2xl mt-4 flex items-center justify-center gap-3 shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <TrendingUp size={20} /> ANALISIS SEKARANG
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && results && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-[2.5rem] overflow-hidden my-auto shadow-2xl">
            {/* AREA PDF */}
            <div id="report-to-print" style={{ backgroundColor: '#FFFFFF' }} className="p-8">
              <div style={{ backgroundColor: '#0F172A' }} className="p-8 rounded-4xl text-white mb-8">
                <h3 className="text-2xl font-black tracking-tight mb-1">Financial Report</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {formData.namaPT} — {formData.tahun}
                </p>
              </div>

              <div style={{ backgroundColor: '#F8FAFC' }} className="p-8 rounded-4xl border border-slate-100 text-center mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Health Score</p>
                <div style={{ color: '#10B981' }} className="text-7xl font-black">
                  {calculateHealthScore(results)}
                </div>
              </div>

              <ResultRow label="Likuiditas (Current Ratio)" type="currentRatio" value={results.currentRatio} suffix="x" status={getStatus('currentRatio', results.currentRatio)} />
              <ResultRow label="Profitabilitas (NPM)" type="npm" value={results.npm} suffix="%" status={getStatus('npm', results.npm)} />
              <ResultRow label="Efisiensi Modal (ROE)" type="roe" value={results.roe} suffix="%" status={getStatus('roe', results.roe)} />
            </div>

            {/* ACTION BUTTONS */}
            <div className="p-8 pt-0 space-y-3">
              <button
                onClick={downloadPDF}
                style={{ backgroundColor: '#2563EB' }}
                className="w-full py-5 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest"
              >
                <Download size={18} /> Simpan Sebagai PDF
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-5 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all"
              >
                Tutup Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
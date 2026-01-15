import React, { useState } from 'react';
import { Info, Calculator, TrendingUp } from 'lucide-react';
import { calculateRatios, getStatus } from './calculations';

const InputField = ({ label, info, value, onChange, placeholder = "0" }) => (
  <div className="flex flex-col gap-1.5 mb-4">
    <div className="flex items-center gap-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="group relative flex items-center">
        <Info size={14} className="text-gray-400 cursor-help hover:text-blue-500 transition-colors" />
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-[11px] rounded-lg shadow-xl z-50 leading-relaxed">
          {info}
          <div className="absolute top-full left-2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 font-medium"
    />
  </div>
);

export default function App() {
  const [formData, setFormData] = useState({
    namaPT: '', tahun: 2026, labaBersih: '', asetLancar: '', utangLancar: '', pendapatan: '', totalEkuitas: ''
  });
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    const res = calculateRatios(formData);
    setResults(res);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Card Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Calculator size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Analisis Rasio Keuangan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className="md:col-span-2">
              <InputField label="Nama Perusahaan" info="Nama entitas bisnis." value={formData.namaPT} onChange={(val) => setFormData({...formData, namaPT: val})} placeholder="Contoh: PT Ratio Finansial" />
            </div>
            <InputField label="Tahun" info="Periode laporan keuangan." value={formData.tahun} onChange={(val) => setFormData({...formData, tahun: val})} />
            <InputField label="Laba Bersih" info="Keuntungan bersih setelah pajak." value={formData.labaBersih} onChange={(val) => setFormData({...formData, labaBersih: val})} />
            <InputField label="Aset Lancar" info="Kas, Bank, dan harta yang mudah cair lainnya." value={formData.asetLancar} onChange={(val) => setFormData({...formData, asetLancar: val})} />
            <InputField label="Utang Lancar" info="Utang jangka pendek (< 1 tahun)." value={formData.utangLancar} onChange={(val) => setFormData({...formData, utangLancar: val})} />
            <InputField label="Pendapatan" info="Total penjualan/omzet." value={formData.pendapatan} onChange={(val) => setFormData({...formData, pendapatan: val})} />
            <InputField label="Total Ekuitas" info="Modal sendiri perusahaan." value={formData.totalEkuitas} onChange={(val) => setFormData({...formData, totalEkuitas: val})} />
          </div>

          <button 
            onClick={handleCalculate}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 mt-4 flex items-center justify-center gap-2"
          >
            <TrendingUp size={20} /> Hitung Rasio Otomatis
          </button>
        </div>

        {/* Card Hasil (Hanya muncul jika sudah dihitung) */}
        {results && (
          <div className="bg-white p-8 rounded-3xl shadow-md border border-blue-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              📊 Hasil Analisis {formData.namaPT}
            </h3>
            <div className="space-y-4">
              <ResultRow label="Current Ratio" value={results.currentRatio} suffix="x" status={getStatus('currentRatio', results.currentRatio)} />
              <ResultRow label="Net Profit Margin" value={results.npm} suffix="%" status={getStatus('npm', results.npm)} />
              <ResultRow label="Return on Equity" value={results.roe} suffix="%" status={getStatus('roe', results.roe)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ResultRow = ({ label, value, suffix, status }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
      <p className="text-xl font-black text-slate-800">{value}{suffix}</p>
    </div>
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${status === 'Sehat' || status === 'Sangat Baik' || status === 'Efisien' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
      {status}
    </span>
  </div>
);
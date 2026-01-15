import React, { useState } from 'react';
import { Info, Calculator, TrendingUp, X } from 'lucide-react';
import { calculateRatios, getStatus, formatNumber } from './calculations';

// Komponen Input yang mendukung teks dan angka dengan format Rupiah
const InputField = ({ label, info, value, onChange, type = "number", placeholder = "0" }) => (
  <div className="flex flex-col gap-1.5 mb-4">
    <div className="flex items-center gap-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="group relative flex items-center">
        <Info size={14} className="text-gray-400 cursor-help hover:text-blue-500 transition-colors" />
        {/* Tooltip Informasi */}
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-[11px] rounded-lg shadow-xl z-50 leading-relaxed">
          {info}
          <div className="absolute top-full left-2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 font-medium"
    />
    {/* Menampilkan format rupiah secara real-time di bawah input angka */}
    {type === "number" && value && (
      <span className="text-[10px] text-blue-600 font-bold ml-1 animate-pulse">
        Terformat: Rp {formatNumber(value)}
      </span>
    )}
  </div>
);

export default function App() {
  const [formData, setFormData] = useState({
    namaPT: '', 
    tahun: 2026, 
    labaBersih: '', 
    asetLancar: '', 
    utangLancar: '', 
    pendapatan: '', 
    totalEkuitas: ''
  });
  
  const [results, setResults] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCalculate = () => {
    const res = calculateRatios(formData);
    setResults(res);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto">
        {/* Card Utama Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Calculator size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Analisis Rasio Keuangan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className="md:col-span-2">
              <InputField 
                label="Nama Perusahaan" 
                type="text" 
                info="Masukkan nama lengkap PT atau entitas bisnis yang dianalisis." 
                value={formData.namaPT} 
                onChange={(val) => setFormData({...formData, namaPT: val})} 
                placeholder="Contoh: PT Ratio Finansial Indonesia" 
              />
            </div>
            <InputField label="Tahun" info="Periode tahun laporan keuangan." value={formData.tahun} onChange={(val) => setFormData({...formData, tahun: val})} />
            <InputField label="Laba Bersih" info="Laba bersih tahun berjalan setelah dikurangi beban pajak." value={formData.labaBersih} onChange={(val) => setFormData({...formData, labaBersih: val})} />
            <InputField label="Aset Lancar" info="Total aset yang likuid atau mudah dicairkan dalam 1 tahun." value={formData.asetLancar} onChange={(val) => setFormData({...formData, asetLancar: val})} />
            <InputField label="Utang Lancar" info="Kewajiban atau utang yang jatuh tempo dalam waktu kurang dari 1 tahun." value={formData.utangLancar} onChange={(val) => setFormData({...formData, utangLancar: val})} />
            <InputField label="Pendapatan" info="Total penjualan bersih atau omzet perusahaan." value={formData.pendapatan} onChange={(val) => setFormData({...formData, pendapatan: val})} />
            <InputField label="Total Ekuitas" info="Modal bersih atau hak pemilik atas kekayaan perusahaan." value={formData.totalEkuitas} onChange={(val) => setFormData({...formData, totalEkuitas: val})} />
          </div>

          <button 
            onClick={handleCalculate} 
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 mt-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <TrendingUp size={20} /> Hitung & Tampilkan Hasil
          </button>
        </div>
      </div>

      {/* POP-UP MODAL HASIL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-100">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            {/* Header Modal */}
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Laporan Hasil Analisis</h3>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-widest mt-1">
                  {formData.namaPT || "Perusahaan Umum"} • {formData.tahun}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-blue-500 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Konten Hasil */}
            <div className="p-6 space-y-4">
              <ResultRow 
                label="Current Ratio (Likuiditas)" 
                value={results.currentRatio} 
                suffix="x" 
                status={getStatus('currentRatio', results.currentRatio)} 
              />
              <ResultRow 
                label="Net Profit Margin (Profitabilitas)" 
                value={results.npm} 
                suffix="%" 
                status={getStatus('npm', results.npm)} 
              />
              <ResultRow 
                label="Return on Equity (Efisiensi Modal)" 
                value={results.roe} 
                suffix="%" 
                status={getStatus('roe', results.roe)} 
              />
              
              <button 
                onClick={() => setShowModal(false)} 
                className="w-full py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all mt-4 border border-slate-200"
              >
                Tutup Analisis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponen baris hasil untuk di dalam modal
const ResultRow = ({ label, value, suffix, status }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}{suffix}</p>
    </div>
    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight ${
      status === 'Sehat' || status === 'Sangat Baik' || status === 'Efisien' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-amber-100 text-amber-700'
    }`}>
      {status}
    </div>
  </div>
);
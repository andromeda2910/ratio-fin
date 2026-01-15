import React, { useState } from 'react';
import { Info, Calculator, TrendingUp, X, AlertCircle, Plus, Minus } from 'lucide-react';
import { calculateRatios, getStatus, formatRibuan } from './calculations';

const InputField = ({ label, info, value, onChange, type = "text", error, isYear = false }) => (
  <div className="flex flex-col gap-1.5 mb-4">
    <div className="flex items-center gap-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="group relative flex items-center">
        <Info size={14} className="text-gray-400 cursor-help" />
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-[11px] rounded-lg shadow-xl z-50">
          {info}
          <div className="absolute top-full left-2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
    
    <div className="relative flex items-center">
      {isYear && (
        <button 
          onClick={() => onChange(String(Number(value) - 1))}
          className="absolute left-2 p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors z-10"
        >
          <Minus size={16} />
        </button>
      )}
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3 ${isYear ? 'text-center px-10' : ''} border ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50/50'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all`}
        placeholder="0"
      />

      {isYear && (
        <button 
          onClick={() => onChange(String(Number(value) + 1))}
          className="absolute right-2 p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors z-10"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
    {error && (
      <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
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
    // Format angka otomatis kecuali untuk nama dan tahun
    const formatted = (field === 'namaPT' || field === 'tahun') ? val : formatRibuan(val);
    setFormData({ ...formData, [field]: formatted });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    let newErrors = {};
    const numericFields = ['labaBersih', 'asetLancar', 'utangLancar', 'pendapatan', 'totalEkuitas'];
    numericFields.forEach(f => {
      if (!formData[f]) newErrors[f] = "Wajib diisi dengan angka";
    });
    if (!formData.namaPT) newErrors.namaPT = "Nama perusahaan wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (validate()) {
      setResults(calculateRatios(formData));
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <Calculator className="text-blue-600" size={28}/> Analisis Keuangan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className="md:col-span-2">
              <InputField label="Nama Perusahaan" info="Nama entitas bisnis." value={formData.namaPT} onChange={(v) => handleInputChange('namaPT', v)} error={errors.namaPT} />
            </div>
            <InputField label="Tahun" isYear={true} info="Tahun laporan keuangan." value={formData.tahun} onChange={(v) => handleInputChange('tahun', v)} />
            <InputField label="Laba Bersih" info="Keuntungan setelah pajak." value={formData.labaBersih} onChange={(v) => handleInputChange('labaBersih', v)} error={errors.labaBersih} />
            <InputField label="Aset Lancar" info="Kas dan harta lancar lainnya." value={formData.asetLancar} onChange={(v) => handleInputChange('asetLancar', v)} error={errors.asetLancar} />
            <InputField label="Utang Lancar" info="Utang jangka pendek (< 1 tahun)." value={formData.utangLancar} onChange={(v) => handleInputChange('utangLancar', v)} error={errors.utangLancar} />
            <InputField label="Pendapatan" info="Total penjualan/omzet." value={formData.pendapatan} onChange={(v) => handleInputChange('pendapatan', v)} error={errors.pendapatan} />
            <InputField label="Total Ekuitas" info="Modal bersih pemilik." value={formData.totalEkuitas} onChange={(v) => handleInputChange('totalEkuitas', v)} error={errors.totalEkuitas} />
          </div>

          <button onClick={handleCalculate} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 mt-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
            <TrendingUp size={20} /> Hitung Rasio Otomatis
          </button>
        </div>
      </div>

      {/* MODAL HASIL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-100">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Laporan Analisis</h3>
                <p className="text-blue-100 text-xs font-bold uppercase mt-1">{formData.namaPT || "PT Umum"} • {formData.tahun}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-blue-500 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-6 space-y-5">
              <ResultRow label="Current Ratio" desc="Kemampuan aset lancar menjamin utang jangka pendek." value={results.currentRatio} suffix="x" status={getStatus('currentRatio', results.currentRatio)} />
              <ResultRow label="Net Profit Margin" desc="Persentase laba dari setiap rupiah penjualan." value={results.npm} suffix="%" status={getStatus('npm', results.npm)} />
              <ResultRow label="Return on Equity" desc="Tingkat pengembalian laba atas modal pemilik." value={results.roe} suffix="%" status={getStatus('roe', results.roe)} />
              
              <button onClick={() => setShowModal(false)} className="w-full py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all mt-2">Tutup Laporan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ResultRow = ({ label, desc, value, suffix, status }) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="flex justify-between items-start mb-2">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}{suffix}</p>
      </div>
      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${status === 'Sehat' || status === 'Efisien' || status === 'Sangat Baik' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
        {status}
      </div>
    </div>
    <p className="text-[10px] text-slate-500 italic leading-relaxed">ℹ️ {desc}</p>
  </div>
);
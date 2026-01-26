import React, { useState, useEffect, useRef } from 'react';
import { Info, Calculator, TrendingUp, X, AlertCircle, Plus, Minus, CheckCircle2, AlertTriangle, RotateCcw, Download, Calendar, Building2 } from 'lucide-react';
// Pastikan semua fungsi ini ada di file calculations.js kamu
import { calculateRatios, getStatus, formatRibuan, getInsight, calculateHealthScore } from './calculations';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';


// CSS tambahan untuk memastikan hasil PDF bersih dan tidak terpotong
const pdfStyles = `
  .pdf-capture-mode {
    width: 700px !important;
    max-width: none !important;
  }
  .pdf-hide {
    display: none !important;
  }
`;


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
        <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-slate-800 text-white text-[10px] rounded-xl shadow-2xl z-50 border border-slate-700">
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-4 ${isYear ? 'text-center px-10' : ''} border-2 ${error ? 'border-red-100 bg-red-50/50' : 'border-slate-100 bg-slate-50/50'} rounded-2xl outline-none focus:border-blue-500 focus:bg-white font-bold text-slate-700 transition-all text-sm`}
        placeholder={placeholder || (isYear ? "2026" : "0")}
      />
      {isYear && <button onClick={() => onChange(String(Number(value) + 1))} className="absolute right-2 p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all z-10"><Plus size={16} /></button>}
    </div>
    {error && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={10} /> {error}</span>}
  </div>
);

const ResultRow = ({ label, type, value, suffix, status }) => {
  const isPositive = status === 'Sehat' || status === 'Efisien' || status === 'Sangat Baik';
  // Menggunakan HEX standar untuk menghindari error oklch pada html2canvas
  const bgColor = isPositive ? '#ECFDF5' : '#FFFBEB';
  const textColor = isPositive ? '#059669' : '#D97706';
  const borderColor = isPositive ? '#D1FAE5' : '#FEF3C7';

  return (
    <div className="p-4 md:p-5 bg-white rounded-2xl border border-slate-100 mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{value}<span className="text-base text-slate-400 ml-0.5">{suffix}</span></p>
        </div>
        <div style={{ backgroundColor: bgColor, color: textColor, border: `1px solid ${borderColor}` }} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase">
          {isPositive ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />} {status}
        </div>
      </div>
      <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
        <span className="font-bold text-blue-700">💡 Insight:</span> {getInsight(type, value)}
      </p>
    </div>
  );
};

export default function App() {
  const [formData, setFormData] = useState({
    namaPT: '', tahun: '2026', labaBersih: '', asetLancar: '', utangLancar: '', pendapatan: '', totalEkuitas: ''
  });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fungsi input dengan format ribuan otomatis
  const handleInputChange = (field, val) => {
    const formattedValue = (field === 'namaPT' || field === 'tahun') ? val : formatRibuan(val);
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const downloadPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    // Berikan jeda sedikit agar UI rendering (loading state) muncul dulu sebelum proses berat dimulai
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const element = document.getElementById('report-to-print');
      if (!element) {
        console.error("Elemen laporan tidak ditemukan");
        setIsGenerating(false);
        return;
      }

      // Paksa lebar tertentu agar tidak terpotong oleh layar kecil (responsive)
      element.classList.add('pdf-capture-mode');

      const opt = {
        margin: [5, 5, 5, 5],
        filename: `Laporan-RatioFin-${formData.namaPT || 'Perusahaan'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 800 // Memberikan area kerja yang cukup luas dalam canvas
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();

      // Kembalikan ke normal
      element.classList.remove('pdf-capture-mode');
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback ke window.print jika html2pdf gagal
      if (confirm("Gagal membuat PDF otomatis. Ingin mencoba menggunakan fitur cetak browser?")) {
        window.print();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const validate = () => {
    let newErrors = {};
    ['namaPT', 'labaBersih', 'asetLancar', 'utangLancar', 'pendapatan', 'totalEkuitas'].forEach(f => {
      if (!formData[f]) newErrors[f] = "Wajib diisi";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <style>{pdfStyles}</style>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div style={{ backgroundColor: '#2563EB' }} className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Calculator size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">RatioFin</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Financial Analyzer</p>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800">Input Data</h2>
            <button
              onClick={() => { setFormData({ namaPT: '', tahun: '2026', labaBersih: '', asetLancar: '', utangLancar: '', pendapatan: '', totalEkuitas: '' }); setResults(null); }}
              className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="md:col-span-2">
              <InputField label="Nama Perusahaan" info="Nama bisnis Anda." value={formData.namaPT} onChange={(v) => handleInputChange('namaPT', v)} error={errors.namaPT} placeholder="Contoh: PT Unilever Indonesia" />
            </div>
            <InputField label="Tahun Laporan" isYear={true} info="Tahun periode keuangan." value={formData.tahun} onChange={(v) => handleInputChange('tahun', v)} />
            <InputField label="Laba Bersih (Rp)" info="Total keuntungan setelah pajak." value={formData.labaBersih} onChange={(v) => handleInputChange('labaBersih', v)} error={errors.labaBersih} />
            <InputField label="Aset Lancar (Rp)" info="Harta liquid (Kas, piutang, dll)." value={formData.asetLancar} onChange={(v) => handleInputChange('asetLancar', v)} error={errors.asetLancar} />
            <InputField label="Utang Lancar (Rp)" info="Kewajiban jangka pendek." value={formData.utangLancar} onChange={(v) => handleInputChange('utangLancar', v)} error={errors.utangLancar} />
            <InputField label="Pendapatan (Rp)" info="Total omzet penjualan." value={formData.pendapatan} onChange={(v) => handleInputChange('pendapatan', v)} error={errors.pendapatan} />
            <InputField label="Total Ekuitas (Rp)" info="Modal bersih pemilik." value={formData.totalEkuitas} onChange={(v) => handleInputChange('totalEkuitas', v)} error={errors.totalEkuitas} />
          </div>

          <button
            onClick={() => { if (validate()) { setResults(calculateRatios(formData)); setShowModal(true); } }}
            style={{ backgroundColor: '#2563EB' }}
            className="w-full py-5 text-white font-black rounded-2xl shadow-xl shadow-blue-100 mt-4 flex items-center justify-center gap-3 uppercase text-xs hover:bg-blue-700 transition-all"
          >
            <TrendingUp size={18} /> Analisis Sekarang
          </button>
        </div>
      </div>

      {showModal && results && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto">
            <div id="report-to-print" className="bg-white">
              <div style={{ backgroundColor: '#0F172A' }} className="p-8 text-white">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calculator size={16} />
                    </div>
                    <span className="font-black tracking-tighter text-lg">RatioFin</span>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors pdf-hide"><X size={20} /></button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <Building2 size={24} className="text-blue-400" /> {formData.namaPT || "Laporan Keuangan"}
                  </h3>
                  <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {formData.tahun}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                    <span>Analisis Rasio Finansial</span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {(() => {
                  const scoreValue = calculateHealthScore(results);
                  const color = scoreValue >= 80 ? "#10B981" : scoreValue >= 50 ? "#F59E0B" : "#EF4444";
                  return (
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center mb-6 shadow-inner">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Skor Kesehatan Finansial</p>
                      <div style={{ color: color }} className="text-6xl font-black">{scoreValue}<span className="text-xl text-slate-300">/100</span></div>
                      <p className="text-[11px] text-slate-500 mt-2 px-4 italic">{scoreValue >= 80 ? "🔥 Kondisi sangat prima!" : scoreValue >= 50 ? "⚠️ Kondisi cukup stabil." : "🚨 Perhatian khusus diperlukan!"}</p>
                    </div>
                  );
                })()}

                <ResultRow label="Current Ratio" type="currentRatio" value={results.currentRatio} suffix="x" status={getStatus('currentRatio', results.currentRatio)} />
                <ResultRow label="Net Profit Margin" type="npm" value={results.npm} suffix="%" status={getStatus('npm', results.npm)} />
                <ResultRow label="Return on Equity" type="roe" value={results.roe} suffix="%" status={getStatus('roe', results.roe)} />

                {/* Radar Chart Visualisasi */}
                <div className="mt-8 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">Visualisasi Kekuatan Finansial</p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: 'Likuiditas', A: Math.min(100, parseFloat(results.currentRatio) * 50), fullMark: 100 },
                        { subject: 'Profitabilitas', A: Math.min(100, parseFloat(results.npm) * 5), fullMark: 100 },
                        { subject: 'Efisiensi Modal', A: Math.min(100, parseFloat(results.roe) * 6.6), fullMark: 100 },
                      ]}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                        <Radar
                          name="Kesehatan"
                          dataKey="A"
                          stroke="#2563eb"
                          fill="#2563eb"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[9px] text-center text-slate-400 mt-2 italic">*Data dinormalisasi berdasarkan standar benchmark industri</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 pt-0 space-y-3">
              <button
                onClick={downloadPDF}
                disabled={isGenerating}
                style={{ backgroundColor: isGenerating ? '#94a3b8' : '#2563EB' }}
                className={`w-full py-4 text-white font-black rounded-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest shadow-lg ${isGenerating ? '' : 'shadow-blue-100 hover:bg-blue-700'} transition-all`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses PDF...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Download Laporan (PDF)
                  </>
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl border border-slate-100 uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
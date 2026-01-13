import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { analyzeRatios } from './calculations'
import { 
  PlusCircle, Database, TrendingUp, BarChart3, Trash2 
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts'

function App() {
  // 1. STATES
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: '', 
    year: new Date().getFullYear(), 
    current_assets: 0, 
    inventory: 0, 
    current_liabilities: 0, 
    net_income: 0, 
    revenue: 0, 
    total_equity: 0
  })

  // 2. HELPER FUNCTIONS
  const formatRibuan = (num) => {
    if (num === 0 || !num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const parseAngka = (str) => {
    const cleanStr = str.replace(/\./g, "");
    return cleanStr === "" ? 0 : parseFloat(cleanStr);
  }

  // 3. DATABASE FUNCTIONS (Didefinisikan dengan useCallback)
  const fetchData = useCallback(async (isMounted = true) => {
    try {
      const { data, error } = await supabase
        .from('financial_data')
        .select('*')
        .order('year', { ascending: true });
      
      if (error) throw error;
      if (isMounted && data) {
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }, []);

  // 4. USE EFFECT (Panggilan data pertama kali)
  useEffect(() => {
    let isMounted = true;
    fetchData(isMounted);

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  // 5. EVENT HANDLERS
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('financial_data').insert([formData])
    
    if (error) {
      alert("Gagal simpan: " + error.message)
    } else {
      alert("Data Berhasil Tersimpan! 🚀")
      setFormData({ 
        ...formData, 
        current_assets: 0, 
        net_income: 0, 
        revenue: 0, 
        total_equity: 0, 
        current_liabilities: 0 
      })
      fetchData(true)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if(window.confirm("Hapus data ini?")) {
      const { error } = await supabase.from('financial_data').delete().eq('id', id)
      if (!error) fetchData(true)
    }
  }

  // 6. CHART DATA
  const chartData = records.map(rec => ({
    name: rec.company_name,
    Likuiditas: (rec.current_assets / rec.current_liabilities).toFixed(2),
    MarginLaba: ((rec.net_income / rec.revenue) * 100).toFixed(2)
  }))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-20 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tighter uppercase">Ratio-Fin</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* KOLOM INPUT */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 sticky top-28 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <PlusCircle size={18} className="text-blue-600"/> Entry Data
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Perusahaan</label>
                <input className="w-full p-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500" 
                  value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} placeholder="Nama PT" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tahun</label>
                  <input type="number" className="w-full p-3 border-2 border-slate-100 rounded-2xl outline-none" 
                    value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-600 uppercase ml-1">Laba Bersih</label>
                  <input type="text" className="w-full p-3 border-2 border-emerald-50 rounded-2xl outline-none" 
                    value={formatRibuan(formData.net_income)} onChange={e => setFormData({...formData, net_income: parseAngka(e.target.value)})} placeholder="0" />
                </div>
              </div>

              {['current_assets', 'current_liabilities', 'revenue', 'total_equity'].map(key => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{key.replace('_', ' ')}</label>
                  <input type="text" className="w-full p-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500" 
                    value={formatRibuan(formData[key])} onChange={e => setFormData({...formData, [key]: parseAngka(e.target.value)})} placeholder="0" />
                </div>
              ))}

              <button disabled={loading} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {loading ? "Menyimpan..." : "Analisis & Simpan"}
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM GRAFIK & LIST */}
        <div className="lg:col-span-8 space-y-8">
          {records.length > 0 && (
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600"/> Tren Rasio Keuangan
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Legend />
                    <Bar dataKey="Likuiditas" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Likuiditas (x)" />
                    <Bar dataKey="MarginLaba" fill="#10b981" radius={[6, 6, 0, 0]} name="Margin Laba (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {records.map((rec) => {
              const res = analyzeRatios(rec)
              return (
                <div key={rec.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-all">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-xl tracking-tight">
                      {rec.company_name} <span className="text-sm font-normal text-slate-400">({rec.year})</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Laba: Rp {rec.net_income.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex gap-10 items-center">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Current</p>
                      <p className={`text-xl font-bold ${res.currentRatio > 1.5 ? 'text-blue-600' : 'text-orange-500'}`}>{res.currentRatio}x</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">NPM</p>
                      <p className="text-xl font-bold text-emerald-600">{res.npm}%</p>
                    </div>
                    <button onClick={() => handleDelete(rec.id)} className="p-3 text-slate-300 hover:text-red-500 transition-all rounded-xl hover:bg-red-50">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
// Fungsi untuk menghitung rasio keuangan
export const calculateRatios = (data) => {
  // Kita hapus titiknya dulu sebelum diubah ke angka (float)
  const parseClean = (val) => parseFloat(String(val).replace(/\./g, '')) || 0;

  const laba = parseClean(data.labaBersih);
  const asetLancar = parseClean(data.asetLancar);
  const utangLancar = parseClean(data.utangLancar);
  const pendapatan = parseClean(data.pendapatan);
  const ekuitas = parseClean(data.totalEkuitas);

  return {
    currentRatio: utangLancar !== 0 ? (asetLancar / utangLancar).toFixed(2) : 0,
    npm: pendapatan !== 0 ? ((laba / pendapatan) * 100).toFixed(2) : 0,
    roe: ekuitas !== 0 ? ((laba / ekuitas) * 100).toFixed(2) : 0
  };
};

export const getStatus = (key, value) => {
  const val = parseFloat(value);
  if (key === 'currentRatio') return val > 1.5 ? 'Sehat' : 'Risiko Likuiditas';
  if (key === 'npm') return val > 10 ? 'Efisien' : 'Margin Rendah';
  if (key === 'roe') return val > 15 ? 'Sangat Baik' : 'Kurang Optimal';
  return '-';
};

// Fungsi format angka dengan titik (untuk tampilan input)
export const formatRibuan = (val) => {
  if (!val) return "";
  const clean = String(val).replace(/\D/g, ""); // ambil angka saja
  return new Intl.NumberFormat('id-ID').format(clean);
};
export const calculateRatios = (data) => {
  const laba = parseFloat(data.labaBersih) || 0;
  const asetLancar = parseFloat(data.asetLancar) || 0;
  const utangLancar = parseFloat(data.utangLancar) || 0;
  const pendapatan = parseFloat(data.pendapatan) || 0;
  const ekuitas = parseFloat(data.totalEkuitas) || 0;

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

// Fungsi Baru: Format angka ke Rupiah/Ribuan
export const formatNumber = (num) => {
  if (!num) return "";
  return new Intl.NumberFormat('id-ID').format(num);
};
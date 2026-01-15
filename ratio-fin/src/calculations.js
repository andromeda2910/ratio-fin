// Fungsi untuk menghitung rasio keuangan
export const calculateRatios = (data) => {
  const laba = parseFloat(data.labaBersih) || 0;
  const asetLancar = parseFloat(data.asetLancar) || 0;
  const utangLancar = parseFloat(data.utangLancar) || 0;
  const pendapatan = parseFloat(data.pendapatan) || 0;
  const ekuitas = parseFloat(data.totalEkuitas) || 0;

  return {
    // Likuiditas: Kemampuan bayar utang jangka pendek
    currentRatio: utangLancar !== 0 ? (asetLancar / utangLancar).toFixed(2) : 0,
    
    // Profitabilitas: Efisiensi mencetak laba dari penjualan
    npm: pendapatan !== 0 ? ((laba / pendapatan) * 100).toFixed(2) : 0,
    
    // Profitabilitas: Efisiensi mengelola modal
    roe: ekuitas !== 0 ? ((laba / ekuitas) * 100).toFixed(2) : 0
  };
};

// Fungsi untuk memberikan indikator baik/buruk
export const getStatus = (key, value) => {
  const val = parseFloat(value);
  if (key === 'currentRatio') return val > 1.5 ? 'Sehat' : 'Risiko Likuiditas';
  if (key === 'npm') return val > 10 ? 'Efisien' : 'Margin Rendah';
  if (key === 'roe') return val > 15 ? 'Sangat Baik' : 'Kurang Optimal';
  return '-';
};
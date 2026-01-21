// Fungsi untuk menghitung rasio keuangan
export const calculateRatios = (data) => {
  // Menghapus titik agar bisa dihitung sebagai angka biasa
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

// Fungsi format ribuan dengan titik
export const formatRibuan = (val) => {
  if (!val) return "";
  const clean = String(val).replace(/\D/g, ""); 
  return new Intl.NumberFormat('id-ID').format(clean);
};

// Fungsi untuk memberikan saran/insight berdasarkan hasil rasio
export const getInsight = (type, value) => {
  // Ubah value ke angka murni agar perbandingan (>=) akurat
  const val = parseFloat(value);

  if (type === 'currentRatio') {
    if (val >= 2) return "Perusahaan memiliki cadangan aset lancar yang sangat aman untuk melunasi utang jangka pendeknya.";
    if (val >= 1) return "Likuiditas cukup, namun perusahaan harus waspada dalam mengelola arus kas jangka pendek.";
    return "Risiko likuiditas tinggi! Perusahaan mungkin kesulitan membayar utang yang jatuh tempo dalam waktu dekat.";
  }
  
  if (type === 'npm') {
    if (val >= 20) return "Sangat efisien! Perusahaan mampu merubah pendapatan menjadi laba bersih dengan margin yang tebal.";
    if (val >= 10) return "Tingkat profitabilitas standar industri. Operasional berjalan cukup baik.";
    return "Margin laba tipis. Perlu evaluasi terhadap biaya operasional atau strategi harga jual.";
  }
  
  if (type === 'roe') {
    if (val >= 15) return "Manajemen sangat efektif dalam memutar modal pemegang saham untuk menghasilkan keuntungan.";
    if (val >= 8) return "Efisiensi modal cukup stabil, memberikan imbal hasil yang wajar bagi investor.";
    return "Pengembalian modal rendah. Potensi ketidakefisienan dalam penggunaan dana milik pemegang saham.";
  }
  
  return "Data analisis tidak tersedia.";
};

export const calculateHealthScore = (ratios) => {
  let score = 0;
  // Bobot: Likuiditas (30), Profitabilitas (40), Efisiensi Modal (30)
  if (ratios.currentRatio >= 1.5) score += 30;
  else if (ratios.currentRatio >= 1.0) score += 15;

  if (ratios.netProfitMargin >= 15) score += 40;
  else if (ratios.netProfitMargin >= 5) score += 20;

  if (ratios.returnOnEquity >= 15) score += 30;
  else if (ratios.returnOnEquity >= 8) score += 15;

  return score;
};
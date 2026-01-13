// src/calculations.js
export const analyzeRatios = (data) => {
  const currentRatio = (data.current_assets / data.current_liabilities).toFixed(2);
  const npm = ((data.net_income / data.revenue) * 100).toFixed(2);
  const roe = ((data.net_income / data.total_equity) * 100).toFixed(2);

  return {
    currentRatio,
    npm,
    roe,
    status: {
      liquidity: currentRatio > 1.5 ? "Sehat" : "Risiko Likuiditas",
      profitability: npm > 10 ? "Sangat Baik" : "Perlu Evaluasi",
    }
  };
};
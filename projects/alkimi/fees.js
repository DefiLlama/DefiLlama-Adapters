const axios = require("axios");

async function fetch(timestamp) {
  const startDate = new Date(timestamp * 1000 - 86400 * 30 * 1000)
    .toISOString()
    .slice(0, 10);
  const endDate = new Date(timestamp * 1000).toISOString().slice(0, 10);

  const url = `https://api.alkimi.org/api/v1/public/data?startDate=${startDate}&endDate=${endDate}`;
  const { data } = await axios.get(url);

  const records = data.data;
  if (!records || records.length === 0) {
    return {
      dailyFees: 0,
      dailyRevenue: 0,
      dailyHoldersRevenue: 0,
      dailyIncentives: 0,
    };
  }

  // Match exact day (±12h tolerance)
  const day = records.find((d) => {
    const dayTs = Math.floor(new Date(d.date).getTime() / 1000);
    return Math.abs(dayTs - timestamp) < 43200;
  });

  // fallback: latest entry
  const entry = day || records[records.length - 1];

  const dailyFees = parseFloat(entry.alkimi_revenue);
  const dailyRevenue = dailyFees;
  const dailyHoldersRevenue = dailyFees;
  const dailyIncentives = 0;

  return {
    dailyFees,
    dailyRevenue,
    dailyHoldersRevenue,
    dailyIncentives,
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "Fees are collected as a % of media spend. Revenue is reported in USD and distributed later as ALKIMI tokens to stakers.",
  fetch,
};

// ---------- Local test block ----------

if (require.main === module) {
  (async () => {
    const now = Math.floor(Date.now() / 1000);

    // Daily
    const daily = await fetch(now);

    // Fetch last 30 days from API
    const startDate = new Date(now * 1000 - 86400 * 30 * 1000)
      .toISOString()
      .slice(0, 10);
    const endDate = new Date(now * 1000).toISOString().slice(0, 10);

    const url = `https://api.alkimi.org/api/v1/public/data?startDate=${startDate}&endDate=${endDate}`;
    const { data } = await axios.get(url);
    const records = data.data.map((r) => ({
      date: r.date,
      revenue: parseFloat(r.alkimi_revenue),
    }));

    function aggregate(days) {
      const slice = records.slice(-days);
      const sum = slice.reduce((s, r) => s + r.revenue, 0);
      return {
        fees: sum,
        revenue: sum,
        holdersRevenue: sum,
        incentives: 0,
      };
    }

    const agg7d = aggregate(7);
    const agg30d = aggregate(30);

    console.log("=== Alkimi Fees Adapter Test Output ===");
    console.log("Daily:", daily);
    console.log("7d Totals:", agg7d);
    console.log("30d Totals:", agg30d);
    console.log("=======================================");
  })().catch(console.error);
}
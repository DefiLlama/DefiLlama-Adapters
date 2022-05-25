const axios = require("axios");
const CREDIX_API = "https://api.credix.finance/stats/markets";

const client = axios.create({
  baseURL: CREDIX_API,
});

async function tvl() {
    const metrics = await client.get("/credix-marketplace");
    const liquidityPoolAmount = parseInt(metrics.data.liquidity_pool_amount.uiAmount); 
    const totalCreditOutstanding = parseInt(metrics.data.total_outstanding_credit.uiAmount);
    return liquidityPoolAmount + totalCreditOutstanding;
}

module.exports = {
  solana: {
    tvl
  },
}
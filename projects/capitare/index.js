const ADDRESSES = require('../helper/coreAssets.json')

const CONTRACT = "0xBf39404960eD6BFB4d782Ab04D232F240aA5B6Bc";
const ABI = {
  getRaised: "function getAllTenantsActiveRaisedAmount() view returns (string[] tenantNames, uint256[] tenantActiveRaisedAmounts, uint256[] tenantActiveProjectsCount, uint256 totalActiveRaisedAmount, uint256 totalActiveProjectsCount)",
  toUSD: "function convertBRLtoUSD(uint256) view returns (uint256)",
};

async function tvl(api) {
  // 1. Take the total BRL raised
  const fundingResult = await api.call({ 
    abi: ABI.getRaised, 
    target: CONTRACT
  });
  const brlRaisedAmount = fundingResult.totalActiveRaisedAmount;
  
  // 2. Convert to USD (returns in 18 decimals)
  const usdFundingGoal18Decimals = await api.call({ 
    abi: ABI.toUSD, 
    target: CONTRACT, 
    params: [brlRaisedAmount] 
  });
  
  // 3. Convert from 18 decimals to 6 decimals (USDT on Polygon)
  // Divide by 10^12 (difference between 18 and 6 decimals)
  const usdFundingGoal6Decimals = BigInt(usdFundingGoal18Decimals) / BigInt(10 ** 12);
  
  // Return the correct value in 6 decimals for USDT
  api.add(ADDRESSES.polygon.USDT, usdFundingGoal6Decimals.toString());
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL equals the total BRL raised across all active Capitare tenants, converted on-chain to USD via `convertBRLtoUSD`, which itself pulls Chainlink's BRL/USD feed.",
  polygon: {
    tvl,
  },
};
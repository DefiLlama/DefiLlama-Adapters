const { staking } = require('./helper/staking');
const { ethers } = require('ethers');
const axios = require('axios');

// Token addresses
const DCBToken = "0xEAc9873291dDAcA754EA5642114151f3035c67A2";
const USDTToken = "0x55d398326f99059ff775485246999027b3197955";

// Staking pool addresses
const stakingPools = [
  "0xD1748192aE1dB982be2FB8C3e6d893C75330884a", // Legacy staking pool contract
  "0xe740758a8cd372c836857defe8011e4e80e48723"  // New staking pools contract
];

// Liquidity pool addresses
const liquidityPools = [
  "0x83D5475BC3bFA08aC3D82ba54b4F86AFc5444398"  // Liquidity pools
];

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');

const erc20ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function"
  }
];

// Mock function to get DCB to USD exchange rate
async function getDCBToUSDExchangeRate() {
  // In a real implementation, fetch this from an API
  return 0.1; // Assume 1 DCB = 0.1 USD for this example
}

async function getTokenBalance(tokenAddress, poolAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);
  const balance = await tokenContract.balanceOf(poolAddress);
  return balance;
}

async function calculateTVL() {
  const dcbToUSD = await getDCBToUSDExchangeRate();
  let totalTVL = 0;
  let totalDCB = 0;
  let totalUSDT = 0;

  for (const pool of liquidityPools) {
    const dcbBalance = await getTokenBalance(DCBToken, pool);
    const usdtBalance = await getTokenBalance(USDTToken, pool);

    const dcbBalanceInEther = parseFloat(ethers.utils.formatUnits(dcbBalance, 18));
    const usdtBalanceInEther = parseFloat(ethers.utils.formatUnits(usdtBalance, 18));

    totalDCB += dcbBalanceInEther;
    totalUSDT += usdtBalanceInEther;
    totalTVL += (dcbBalanceInEther * dcbToUSD) + usdtBalanceInEther;
  }

  console.log(`Total DCB: ${totalDCB} DCB`);
  console.log(`Total USDT: ${totalUSDT} USDT`);
  console.log(`Total TVL: ${totalTVL} USD`);

  return totalTVL;
}

module.exports = {
  bsc: {
    tvl: async () => {
      const tvl = await calculateTVL();
      return { 'usd': tvl };
    },
    staking: staking(stakingPools, DCBToken)
  },
};

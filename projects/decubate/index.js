const { ethers } = require('ethers');
const { PromisePool } = require('@supercharge/promise-pool');
const axios = require('axios');

const DCBToken = "0xEAc9873291dDAcA754EA5642114151f3035c67A2";
const stakingPools = [
  "0xD1748192aE1dB982be2FB8C3e6d893C75330884a", // Legacy staking pool contract
  "0xe740758a8cd372c836857defe8011e4e80e48723"  // New staking pools contract
];

const LPToken = "0x83d5475bc3bfa08ac3d82ba54b4f86afc5444398"; // Token Pancake LPs (Cake-LP)
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

// Function to get the current DCB to USD exchange rate from CoinGecko
async function getDCBToUSDExchangeRate() {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=decubate&vs_currencies=usd');
  return response.data.decubate.usd;
}

// Staking Calculation
async function calculateStakingTVL(poolAddresses, tokenAddress) {
  let totalStaked = 0;

  for (const poolAddress of poolAddresses) {
    const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);
    const balance = await tokenContract.balanceOf(poolAddress);
    totalStaked += parseFloat(ethers.utils.formatUnits(balance, 18));
  }

  return totalStaked;
}

// Pool2 Calculation
async function getReserves(contractAddress) {
  const parentContractABI = [
    {
      "constant": true,
      "inputs": [],
      "name": "getReserves",
      "outputs": [
        { "internalType": "uint112", "name": "_reserve0", "type": "uint112" },
        { "internalType": "uint112", "name": "_reserve1", "type": "uint112" },
        { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "token0",
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "token1",
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const contract = new ethers.Contract(contractAddress, parentContractABI, provider);
  const reserves = await contract.getReserves();
  const token0 = await contract.token0();
  const token1 = await contract.token1();
  
  return { reserves, token0, token1 };
}

async function calculatePool2TVL(lpTokenAddress, tokenAddress) {
  const { reserves, token0, token1 } = await getReserves(lpTokenAddress);

  let tokenReserve, otherTokenReserve;
  if (token0.toLowerCase() === tokenAddress.toLowerCase()) {
    tokenReserve = parseFloat(ethers.utils.formatUnits(reserves._reserve0, 18));
    otherTokenReserve = parseFloat(ethers.utils.formatUnits(reserves._reserve1, 18));
  } else {
    tokenReserve = parseFloat(ethers.utils.formatUnits(reserves._reserve1, 18));
    otherTokenReserve = parseFloat(ethers.utils.formatUnits(reserves._reserve0, 18));
  }

  return { tokenReserve, otherTokenReserve };
}

async function calculateTVL() {
  const dcbToUSD = await getDCBToUSDExchangeRate();

  const totalStakedDCB = await calculateStakingTVL(stakingPools, DCBToken);
  const totalStakingTVL = totalStakedDCB * dcbToUSD;

  const { tokenReserve, otherTokenReserve } = await calculatePool2TVL(LPToken, DCBToken);
  const totalPool2TVL = tokenReserve * dcbToUSD;

  const totalTVL = totalStakingTVL + totalPool2TVL;

  console.log(`Total Staked DCB: ${totalStakedDCB} DCB`);
  console.log(`Total Staking TVL: ${totalStakingTVL} USD`);
  console.log(`Total Pool2 DCB: ${tokenReserve} DCB`);
  console.log(`Total Pool2 TVL: ${totalPool2TVL} USD`);
  console.log(`Total TVL: ${totalTVL} USD`);

  return totalTVL;
}

module.exports = {
  bsc: {
    tvl: async () => {
      const tvl = await calculateTVL();
      return { 'usd': tvl };
    },
    staking: async () => {
      const dcbToUSD = await getDCBToUSDExchangeRate();
      const totalStakedDCB = await calculateStakingTVL(stakingPools, DCBToken);
      return { 'usd': totalStakedDCB * dcbToUSD };
    },
    pool2: async () => {
      const dcbToUSD = await getDCBToUSDExchangeRate();
      const { tokenReserve } = await calculatePool2TVL(LPToken, DCBToken);
      return { 'usd': tokenReserve * dcbToUSD };
    }
  }
};

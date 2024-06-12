const { sumTokens2 } = require("../helper/unwrapLPs");
const { getTokenSupply } = require("../helper/solana")
const ATOKENS_ETHEREUM = ['0x028171bCA77440897B824Ca71D1c56caC55b68A3', '0x101cc05f4A51C0319f570d5E146a8C625198e636', '0xd4937682df3C8aEF4FE912A96A74121C0829E664'];
const APOOL_ETHEREUM = ['0xFC66c25dbDb0606e7F9cA1d2754Eb0A0f8306dA9', '0x5E88f6dc0aa126FA28A137B24d0B4d7231352a0B', '0xB7a2930e66D84Da74CdcFE4f97FaE9fC8f1114e8'];
const ATOKENS_ARBITRUM = ['0x6ab707Aca953eDAeFBc4fD23bA73294241490620', '0x625E7708f30cA75bfd92586e17077590C60eb4cD', '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE', '0x724dc807b04555b71ed48a6896b6f41593b8c637'];
const APOOL_ARBITRUM = ['0xad7e2165FEa1d29030dF806cE4d530fa7a44511B', '0x23E7f09Fae0933db01420173726d18Dae809022C', '0xB7D37C5b15CDF29265C20668c20cD78586c423A8', '0x91beB5C41dF001175b588C9510327D53f278972A'];
const COMPOUND_ETHEREUM = [
  ['0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9', '0x372025203D25589eC3aDAd82652De78eC76fFabC'],
  ['0x39AA39c021dfbaE8faC545936693aC917d5E7563', '0xE87Adc9D382Eee54C1eDE017D6E5C1324D59F457'],
];
async function tvl_eth(api) {
  await sumTokens2({ api, tokensAndOwners: COMPOUND_ETHEREUM })
  await sumTokens2({ api, tokensAndOwners2: [ATOKENS_ETHEREUM, APOOL_ETHEREUM] })
}

async function tvl_arb(api) {
  await sumTokens2({ api, tokensAndOwners2: [ATOKENS_ARBITRUM, APOOL_ARBITRUM] })
}

async function tvl_sol(api) {
  const fUSDC = 'Ez2zVjw85tZan1ycnJ5PywNNxR6Gm4jbXQtZKyQNu3Lv'
  const supply = await getTokenSupply(fUSDC)
  api.add(fUSDC, supply * 1e6)
}

module.exports = {
  methodology: "Value of stablecoins + interest accrued in pools. TVL on Solana is equal to the total supply of fUSDC.",
  ethereum: {
    tvl: tvl_eth,
  },
  arbitrum: {
    tvl: tvl_arb,
  },
  solana: {
    tvl: tvl_sol,
  }
}; // node test.js projects/fluidity-money/index.js
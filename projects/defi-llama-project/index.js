const { sumTokensExport } = require('../helper/unwrapLPs')
const governanceTokenABI = require('./abi.json')

// Your deployed contract addresses on Base mainnet
const LENDING_PROTOCOL = '0xDe9221A0A017B07B538C7C5b159456AD43ba603B'
const STAKING_CONTRACT = '0x77D8719e38080723ea0dd5135Bc58d7AF8bb0a77'
const GOVERNANCE_TOKEN = '0x1c76dC283f93C07f35B37307b9e0D554Fe6E6723'

// Base mainnet token addresses (verified from coreAssets.json)
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const USDT = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
const WETH = '0x4200000000000000000000000000000000000006'

module.exports = {
  methodology: 'Counts deposits in the lending protocol and staked governance tokens. TVL includes USDC, USDT, WETH, and governance tokens held in the lending protocol contract. Staking TVL includes governance tokens staked in the staking contract.',
  start: 1700000000, // January 2024 - adjust to your protocol's actual start date
  timetravel: true,
  misrepresentedTokens: false,
  base: {
    // Core TVL - deposits in the lending protocol
    tvl: sumTokensExport({ 
      owner: LENDING_PROTOCOL,
      tokens: [USDC, USDT, WETH, GOVERNANCE_TOKEN],
    }),
    
    // Staking TVL - staked governance tokens
    staking: sumTokensExport({ 
      owner: STAKING_CONTRACT,
      tokens: [GOVERNANCE_TOKEN],
    }),
  }
};

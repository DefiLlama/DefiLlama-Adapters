const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// 🏦 Vault contract that holds trading liquidity
const VAULT = '0xeB0E5E1a8500317A1B8fDd195097D5509Ef861de'

// 💰 Supported assets in the vault
const TOKENS = [
  ADDRESSES.bsc.USDT, // USDT
  ADDRESSES.bsc.USDC, // USDC
  ADDRESSES.bsc.WBNB, // WBNB
  ADDRESSES.bsc.BTCB, // BTCB
  ADDRESSES.bsc.ETH, // ETH
  '0x570A5D26f7765Ecb712C0924E4De545B89fD43dF', // SOL
  '0xbA2aE424d960c26247Dd6c32edC70B295c744C43', // DOGE
  '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE', // XRP
]

// 🧱 Tokens and staking contracts
const MONEY = '0x4fFe5ec4D8B9822e01c9E49678884bAEc17F60D9'
const STAKING_CONTRACTS = [
  '0xEB445ac93eDc6F91E69CA35674CEbE9CC96CFEaB', // RewardTrackerStakedMONEY
  '0x8Bb13A67be7d9ea51cA74327bC81807D1461403D', // RewardTrackerStakedBonusMONEY
  '0xeBBc55644c9bD5095a0eA0Ea64ac92Fb60E0B5fB', // RewardTrackerStakedBonusFeeMONEY
  '0xe3394F30568D36593147c93Cce75cc497319C99D', // VestedMONEY
]

// 🧮 Vault TVL — liquidity backing open positions
async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: TOKENS.map(t => [t, VAULT]),
  })
}

// 💎 Staking TVL — MONEY & esMONEY across all reward trackers
async function staking(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      ...STAKING_CONTRACTS.map(c => [MONEY, c]),
      ...STAKING_CONTRACTS.map(c => [ES_MONEY, c]),
    ],
  })
}

module.exports = {
  bsc: { tvl, staking },
  methodology:
    'TVL includes vault assets (USDT, USDC, WBNB, BTCB, ETH, SOL, DOGE, XRP) held in the main Vault. Staking TVL includes MONEY and esMONEY tokens staked across reward tracker and vesting contracts.',
}

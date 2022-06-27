const { get } = require("../helper/http");
const { sumTokens2 } = require('../helper/unwrapLPs')

let _response

// --- Grab from here the pools available atm ---
const DOPPLE_API = "https://api-v3.dopple.finance/multi-chain";
const CHAINS = {
  56: 'bsc',
  250: 'fantom',
  1666600000: 'harmony'
}

const assetsOnExchange = {
  [CHAINS[56]]: [
    // * KUSD
    '0x940Ff63e82d15fb47371BFE5a4ed7D7D183dE1A5',
    // * BUSD
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    // * USDT
    "0x55d398326f99059fF775485246999027B3197955",
    // * USDC
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    // * DAI
    "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    // * UST
    "0x23396cF899Ca06c4472205fC903bDB4de249D6fC",
    // * BTCB
    "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    // * renBTC
    '0xfCe146bF3146100cfe5dB4129cf6C82b0eF4Ad8c',
    // * USDN
    '0x03ab98f5dc94996F8C33E15cD4468794d12d41f9',
    // * TUSD
    '0x14016E85a25aeb13065688cAFB43044C2ef86784',
    // * DOLLY
    "0xfF54da7CAF3BC3D34664891fC8f3c9B6DeA6c7A5"
  ],
  [CHAINS[250]]: [
    // * USDC
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // * fUSDT
    '0x049d68029688eabf473097a2fc38ef61633a3c7a',
    // * DAI
    '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e',
    // * MIM
    '0x82f0b8b456c1a451378467398982d4834b6829c1',
  ],
  [CHAINS[1666600000]]: [
    // * KUSD
    '0x60d717d69f964f4b67de9786e1796a4cf0d89940',
    // * 1USDC
    '0x985458e523db3d53125813ed68c274899e9dfab4',
    // * 1USDT
    '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f',
    // * 1BUSD,
    '0xe176ebe47d621b984a73036b9da5d834411ef734',
    // * bscUSDC
    '0x44cED87b9F1492Bf2DCf5c16004832569f7f6cBa',
    // * bscUSDT
    '0x9A89d0e1b051640C6704Dde4dF881f73ADFEf39a',
    // * bscBUSD
    '0x0aB43550A6915F9f67d0c454C2E90385E6497EaA',
  ]
}

function getTvl(chainId) {
  return async (_, _b, chainBlocks) => {
    const chain = CHAINS[chainId]
    const block = chainBlocks[chain]
    if (!_response) _response = get(DOPPLE_API)
    const response = await _response
    const pools = response[chainId]
    const toa = []
    for (const pool of pools) {
      for (const asset of assetsOnExchange[CHAINS[chainId]]) {
        toa.push([asset, pool.swapAddress])
      }
    }

    return sumTokens2({ tokensAndOwners: toa, chain, block, })
  }
}

module.exports = {
  bsc: {
    tvl: getTvl(56),
  },
  fantom: {
    tvl: getTvl(250),
  },
  harmony: {
    tvl: getTvl(1666600000),
  },
};

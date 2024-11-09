const sdk = require("@defillama/sdk")
const { sumTokens2 } = require("./helper/unwrapLPs");

// STAKING = xBPT staking on mainnet + LP staking on mainnet + LP staking on polygon/cometh
// xBPT staking on mainnet
const BPT_mainnet = '0x0eC9F76202a7061eB9b3a7D6B59D36215A7e37da'
const xBPT_mainnet = '0x46c5098f73fa656e82d7e9afbf3c00b32b7b1ee2'

// LP tokens staked on sushiswap (mainnet against weth)  
const sushiMasterchef = "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd"
const BPT_WETH_LP_mainnet_sushi = '0x57024267e8272618f9c5037d373043a8646507e5' 

// LP tokens staked on polygon (cometh against weth and must)
const BPT_polygon = '0x6863BD30C9e313B264657B107352bA246F8Af8e0'
const BPT_WETH_LP_cometh = '0x1f2f74bf3478ab4614e002cad1c67d3a84a5c2bd'
const BPT_MUST_LP_cometh = '0xc8978a3de5ce54e1a2fe88d2036e2cc972238126' 
const BPT_WETH_LP_staking = '0xe3ae080d6a4f1ac5ababf514f871428342135877'
const BPT_MUST_LP_staking = '0xe29544a8145978a2355e44fbac61f4748f0ecca6'

async function mainnetStaking(api) { 
  return api.sumTokens({ 
    tokensAndOwners: [
      [BPT_mainnet, xBPT_mainnet],
      [BPT_WETH_LP_mainnet_sushi, sushiMasterchef]
    ],
  })
}

async function polygonStaking(api) { 
  return sumTokens2({ api, resolveLP: true, 
    tokensAndOwners: [
      [BPT_WETH_LP_cometh, BPT_WETH_LP_staking],
      [BPT_MUST_LP_cometh, BPT_MUST_LP_staking]
    ],
  })
}

module.exports = {
  methodology: "TVL of BlackPool corresponds to staking which consists of xBPT staking on mainnet + LP staking on mainnet/sushiswap (BPT/WETH in masterchef) + LP staking on polygon/cometh (BPT/WETH + BPT/MUST)",
  ethereum: {
    staking: mainnetStaking,
    tvl: () => ({})
  },
  polygon: {
    staking: polygonStaking,
    tvl: () => ({})
  },
}

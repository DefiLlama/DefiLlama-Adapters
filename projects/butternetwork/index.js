const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

const config = {
  bsc: {
    mosContract: "0x630105189c7114667a7179aa57f07647a5f42b7f",
    tokens: {
      USDT: ADDRESSES.bsc.USDT,
      USDC: ADDRESSES.bsc.USDC,
      DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
      ETH: ADDRESSES.bsc.ETH,
      // MAP: "0x8105ECe4ce08B6B6449539A5db23e23b973DfA8f"
    }
  },
  polygon: {
    mosContract: "0x630105189c7114667a7179aa57f07647a5f42b7f",
    tokens: {
      USDT: ADDRESSES.polygon.USDT,
      USDC: ADDRESSES.polygon.USDC,
      DAI: ADDRESSES.polygon.DAI,
      ETH: ADDRESSES.polygon.WETH_1,
      // MAP: "0xBAbceE78586d3e9E80E0d69601A17f983663Ba6a"
    }
  },
  ethereum: {
    mosContract: "0x630105189c7114667a7179aa57f07647a5f42b7f",
    tokens: {
      USDT: ADDRESSES.ethereum.USDT,
      USDC: ADDRESSES.ethereum.USDC,
      DAI: ADDRESSES.ethereum.DAI,
      ETH: ADDRESSES.ethereum.WETH,
      // MAP: "0x9e976f211daea0d652912ab99b0dc21a7fd728e4"
    }
  },
  near: {
    mosContract: "mos.mfac.butternetwork.near",
    tokens: {
      USDT: "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
      USDC: "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
      DAI: "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near",
      ETH: "aurora",
      // MAP: "mapo.mfac.butternetwork.near"
    }
  },
  map: {
    mosContract: "0x630105189c7114667a7179Aa57f07647a5f42B7F",
    tokens: {
      // USDT: "0x33daba9618a75a7aff103e53afe530fbacf4a3dd",
      // USDC: ADDRESSES.map.USDC,
      // DAI: "0xEdDfAac857cb94aE8A0347e2b1b06f21AA1AAeFA",
      // ETH: ADDRESSES.map.ETH,
      MAP: ADDRESSES.map.WMAPO
    }
  }
}

module.exports = {
  methodology: 'get the amount of token deposited in MOS contract on each supported chain.',
};

Object.keys(config).forEach(chain => {
  const { mosContract, tokens } = config[chain]
  module.exports[chain] = {
    tvl:sumTokensExport({ owner: mosContract, tokens: Object.values(tokens), logCalls: true })
  }
})
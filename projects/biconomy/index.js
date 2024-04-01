const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { returnEthBalance } = require("../helper/utils")
const { getChainTransform } = require("../helper/portedTokens");

// taken from https://docs.biconomy.io/products/hyphen-instant-cross-chain-transfers/contract-addresses
const config = {
  ethereum: {
    bridges: [
      '0xebaB24F13de55789eC1F3fFe99A285754e15F7b9',
      '0x2A5c2568b10A0E826BfA892Cf21BA7218310180b',
    ],
    tokens: [
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
    ]
  },
  polygon: {
    bridges: [
      '0xebaB24F13de55789eC1F3fFe99A285754e15F7b9',
      '0x2A5c2568b10A0E826BfA892Cf21BA7218310180b',
    ],
    tokens: [
      ADDRESSES.polygon.USDT,
      ADDRESSES.polygon.USDC,
      ADDRESSES.polygon.DAI,
      ADDRESSES.polygon.WETH_1,
    ]
  },
  avax: {
    bridges: [
      '0xebaB24F13de55789eC1F3fFe99A285754e15F7b9',
      '0x2A5c2568b10A0E826BfA892Cf21BA7218310180b',
    ],
    tokens: [
      ADDRESSES.avax.USDT_e,
      ADDRESSES.avax.USDC_e,
      ADDRESSES.avax.DAI,
      ADDRESSES.avax.WETH_e,
    ]
  },
  bsc: {
    bridges: [
      '0x279ac60785a2fcb85550eb243b9a42a543171cc7',
      '0x94D3E62151B12A12A4976F60EdC18459538FaF08',
    ],
    tokens: [
      ADDRESSES.bsc.ETH,
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.USDT,
    ]
  },
  optimism: {
    bridges: [
      '0xb4778f5aefeb4605ed96e893417271d4a55e32ee',
      '0x856cb5c3cbbe9e2e21293a644aa1f9363cee11e8',
    ],
    tokens: [
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      ADDRESSES.optimism.USDC,
    ]
  },
  arbitrum: {
    bridges: [
      '0xb4778f5aefeb4605ed96e893417271d4a55e32ee',
      '0x856cb5c3cbbe9e2e21293a644aa1f9363cee11e8',
    ],
    tokens: [
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      ADDRESSES.arbitrum.USDC,
    ]
  },
}

module.exports = {
    hallmarks:[
    [1651881600, "UST depeg"],
  ],
  methodology:
    "Biconomy TVL is the USD value of token balances in the Hyphen 2.0 contracts.",
}

Object.keys(config).forEach(chain => module.exports[chain] = {
  tvl: async (time, _, { [chain]: block }) => {
    const { bridges, tokens, } = config[chain]
    return sumTokens2({ chain, block, owners: bridges, tokens });
  }
})
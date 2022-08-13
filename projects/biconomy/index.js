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
      '0x6b175474e89094c44da98b954eedeac495271d0f',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '0xdac17f958d2ee523a2206206994597c13d831ec7',
    ]
  },
  polygon: {
    bridges: [
      '0xebaB24F13de55789eC1F3fFe99A285754e15F7b9',
      '0x2A5c2568b10A0E826BfA892Cf21BA7218310180b',
    ],
    tokens: [
      '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    ]
  },
  avax: {
    bridges: [
      '0xebaB24F13de55789eC1F3fFe99A285754e15F7b9',
      '0x2A5c2568b10A0E826BfA892Cf21BA7218310180b',
    ],
    tokens: [
      '0xc7198437980c041c805a1edcba50c1ce5db95118',
      '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
      '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
      '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
    ]
  },
  bsc: {
    bridges: [
      '0x279ac60785a2fcb85550eb243b9a42a543171cc7',
      '0x94D3E62151B12A12A4976F60EdC18459538FaF08',
    ],
    tokens: [
      '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      '0x55d398326f99059ff775485246999027b3197955',
    ]
  },
  optimism: {
    bridges: [
      '0xb4778f5aefeb4605ed96e893417271d4a55e32ee',
      '0x856cb5c3cbbe9e2e21293a644aa1f9363cee11e8',
    ],
    tokens: [
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    ]
  },
  arbitrum: {
    bridges: [
      '0xb4778f5aefeb4605ed96e893417271d4a55e32ee',
      '0x856cb5c3cbbe9e2e21293a644aa1f9363cee11e8',
    ],
    tokens: [
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    ]
  },
}

module.exports = {
  misrepresentedTokens: false,
  methodology:
    "Biconomy TVL is the USD value of token balances in the Hyphen 2.0 contracts.",
}

Object.keys(config).forEach(chain => module.exports[chain] = {
  tvl: async (time, _, { [chain]: block }) => {
    const { bridges, tokens, } = config[chain]
    return sumTokens2({ chain, block, owners: bridges, tokens, });
  }
})
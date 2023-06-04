const { fetchURL } = require("../helper/utils");
const sdk = require("@defillama/sdk");
const { getBalance, sumSingleBalance, getDenomBalance, } = require('../helper/chain/terra')
const { default: BigNumber } = require("bignumber.js");

async function borrowed() {
  const data = await fetchURL("https://api.anchorprotocol.com/api/v1/borrow")
  return {
    "terrausd": Number(data.data.total_borrowed) / 1e6
  }
}

async function avalancheTVL(timestamp, ethBlock, chainBlocks) {
  const chain = "avax"
  const wormholeAnchorUST = "0xaB9A04808167C170A9EC4f8a87a0cD781ebcd55e"
  const block = chainBlocks[chain]
  const { output: aUSTBalance } = await sdk.api.erc20.totalSupply({ target: wormholeAnchorUST, block, chain })
  return {
    "anchorust": BigNumber(aUSTBalance).dividedBy(10 ** 6)
  }
}

module.exports = {
  timetravel: false,
  methodology: `We use the Anchor subgraph to get the amount of bLUNA and bETH used as collateral on anchor and the UST that is on anchor but has not been lent, we then use Coingecko to price the tokens in USD.`,
  terra: {
    tvl: async () => {
      const balances = {}
      const [eth, bLuna, uusd] = await Promise.all([
        getBalance('terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun', 'terra10cxuzggyvvv44magvrh3thpdnk9cmlgk93gmx2'),
        getBalance('terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp', 'terra1ptjp2vfjrwh0j0faj9r6katm640kgjxnwwq9kn'),
        // getDenomBalance('uusd', 'terra1sepfj7s0aeg5967uxnfk4thzlerrsktkpelm5s'),
      ])
      sumSingleBalance(balances, 'terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun', eth,)
      sumSingleBalance(balances, 'terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp', bLuna,)
      // sumSingleBalance(balances, 'uusd', uusd,)
      return balances
    },
    // borrowed
  },
  avax: {
    tvl: avalancheTVL
  },
  hallmarks: [
    [1651881600, "UST depeg"],
  ]
}

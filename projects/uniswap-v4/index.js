const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require('../helper/cache/getLogs');
const { nullAddress } = require("../helper/tokenMapping");

// from https://docs.uniswap.org/contracts/v4/deployments
const config = {
  ethereum: { factory: "0x000000000004444c5dc75cB358380D2e3dE08A90", fromBlock: 21688329 },
  optimism: { factory: "0x9a13f98cb987694c9f086b1f5eb990eea8264ec3", fromBlock: 130947675 },
  base: { factory: "0x498581ff718922c3f8e6a244956af099b2652b2b", fromBlock: 25350988 },
  arbitrum: { factory: "0x360e68faccca8ca495c1b759fd9eee466db9fb32", fromBlock: 297842872 },
  polygon: { factory: "0x67366782805870060151383f4bbff9dab53e5cd6", fromBlock: 66980384 },
  blast: { factory: "0x1631559198a9e474033433b2958dabc135ab6446", fromBlock: 14377311 },
  zora: { factory: "0x0575338e4c17006ae181b47900a84404247ca30f", fromBlock: 25434534 },
  wc: { factory: "0xb1860d529182ac3bc1f51fa2abd56662b7d13f33", fromBlock: 9111872 },
  ink: { factory: "0x360e68faccca8ca495c1b759fd9eee466db9fb32", fromBlock: 4580556 },
  soneium: { factory: "0x360e68faccca8ca495c1b759fd9eee466db9fb32", fromBlock: 2473300 },
  avax: { factory: "0x06380c0e0912312b5150364b9dc4542ba0dbbc85", fromBlock: 56195376 },
  bsc: { factory: "0x28e2ea090877bf75740558f6bfb36a5ffee9e9df", fromBlock: 45970610 },
  unichain: { factory: "0x1F98400000000000000000000000000000000004", fromBlock: 1 },
}

const eventAbi = "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)"

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi, fromBlock, })
      const tokenSet = new Set()
      const ownerTokens = []
      logs.forEach(log => {
        tokenSet.add(log.currency0)
        tokenSet.add(log.currency1)
        if (log.hooks !== nullAddress) {
          ownerTokens.push([[log.currency0, log.currency1], log.hooks])
        }
      })
      ownerTokens.push([Array.from(tokenSet), factory])
      return sumTokens2({ api, ownerTokens, permitFailure: true, })
    }
  }
})
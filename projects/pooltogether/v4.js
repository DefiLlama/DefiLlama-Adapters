const { sumTokens } = require('../helper/unwrapLPs')

const V4_POOLS = {
  ethereum: [
    ['0xbcca60bb61934080951369a648fb03df4f96263c', '0x32e8d4c9d1b711bc958d0ce8d14b41f77bb03a64']
  ],
  polygon: [
    ['0x1a13f4ca1d028320a707d99520abfefca3998b7f', '0xD4F6d570133401079D213EcF4A14FA0B4bfB5b9C']
  ],
  avax: [
    ['0x46a51127c3ce23fb7ab1de06226147f446e4a857', '0x7437db21A0dEB844Fa64223e2d6Db569De9648Ff']
  ],
  optimism: [
    ['0x625E7708f30cA75bfd92586e17077590C60eb4cD', '0x4ecB5300D9ec6BCA09d66bfd8Dcb532e3192dDA1']
  ]
}

async function getChainBalances(chain, block, transform) {
  const balances = {}

  transform = transform || ((addr) => `${chain}:${addr}`)

  await sumTokens(balances, V4_POOLS[chain], block, chain, transform)

  return balances
}

async function ethereum(timestamp, block) {
  return getChainBalances('ethereum', block)
}

async function polygon(timestamp, block, chainBlocks) {
  return getChainBalances('polygon', chainBlocks.polygon)
}

async function avax(timestamp, block, chainBlocks) {
  return getChainBalances(
    'avax',
    chainBlocks.avax,
    () => `avax:0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664`
  )
}

async function optimism(timestamp, block, chainBlocks) {
  return getChainBalances(
    'optimism',
    chainBlocks.optimism,
    () => `optimism:0x7F5c764cBc14f9669B88837ca1490cCa17c31607`
  )
}

module.exports = {
  ethereum,
  polygon,
  avax,
  optimism
}

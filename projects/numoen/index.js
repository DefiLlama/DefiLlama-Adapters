const { getLogs, getAddress, } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: {
    factory: '0x1B327eFf5033922B0f88FC4D56C29d7AF5a8ecdB',
    fromBlock: 43951762,
  },
}

const blocks = {
  celo: 17976668,
  arbitrum: 65269032,
  polygon: 40648569,
}

async function tvl(api) {
  const ownerTokens = []

  const logs = await getLogs({
    api,
    fromBlock: blocks[api.chain],
    target: '0x8396a792510a402681812ece6ad3ff19261928ba',
    topics: ['0x581e7fde17a1f90a422f4ef8f75f22c3437a96787d3bf54aa93c838b740183c3'],
  })
  logs.forEach(i => {
    const base = getAddress(i.topics[1])
    const speculative = getAddress(i.topics[2])
    const lendgine = getAddress(i.data.slice(154-26))
    const tokens = [base, speculative]
    ownerTokens.push([tokens, lendgine])
  })
  ownerTokens.push(...(await ownerTokensExtra(api)))
  return sumTokens2({ api, ownerTokens})
}

Object.keys(blocks).forEach(chain => {  module.exports[chain] = { tvl }})

async function ownerTokensExtra(api) {
  const { factory, fromBlock, } = config[api.chain] ?? {}
  if (!factory) return []
  const ownerTokens = []

  const logs = await getLogs({
    api, fromBlock, target: factory,
    topics: ['0x1c8c5ae778c5728afc9c5b6cd391acf7cb01a6c6d4988fb2de551001ec7dc644'],
    eventAbi: 'event LendgineCreated(address indexed base, address indexed speculative, uint256 baseScaleFactor, uint256 speculativeScaleFactor, uint256 indexed upperBound, address lendgine, address pair)',
    onlyArgs: true,
  })
  logs.forEach(i => {
    const tokens = [i.base, i.speculative]
    ownerTokens.push([tokens, i.lendgine])
    ownerTokens.push([tokens, i.pair])
  })
  return ownerTokens
}

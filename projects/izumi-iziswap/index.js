const ADDRESSES = require('../helper/coreAssets.json')

let abi = require('./abi')
const { sumTokens2, } = require('../helper/unwrapLPs')

const nullAddress = ADDRESSES.null
const poolHelpers = {
  'bsc': '0x93C22Fbeff4448F2fb6e432579b0638838Ff9581',
  'arbitrum': '0x611575eE1fbd4F7915D0eABCC518eD396fF78F0c',
  'era': '0x936c9A1B8f88BFDbd5066ad08e5d773BC82EB15F',
  'meter': '0x07aBf894D5C25E626bb30f75eFC728a1d86BEeDC',
  'aurora': '0xE78e7447223aaED59301b44513D1d3A892ECF212',
  // 'ethereumclassic': '0x1D377311b342633A970e71a787C50F83858BFC1B',
  'cronos': '0x33531bDBFE34fa6Fd5963D0423f7699775AacaaF',
  'polygon': '0x33531bDBFE34fa6Fd5963D0423f7699775AacaaF',
  // 'conflux': '0x1502d025BfA624469892289D45C0352997251728',
  'mantle': '0x1502d025BfA624469892289D45C0352997251728',
  'ethereum': '0x19b683A2F45012318d9B2aE1280d68d3eC54D663',
  'ontology_evm': '0x110dE362cc436D7f54210f96b8C7652C2617887D',
  'ultron' : '0xcA7e21764CD8f7c1Ec40e651E25Da68AeD096037'
}

const blacklistedTokens = [
  ADDRESSES.bsc.iUSD,
  '0x1382628e018010035999A1FF330447a0751aa84f',
]

const tvl = async (_, _1, _2, { api }) => {
  const chain = api.chain
  const toa = []
  let i = 1
  let foundLastPool = false
  const chunkSize = 10
  const poolMetaData = []
  const bTokens = [...blacklistedTokens]

  do {
    const calls = []
    for (let j = i; j < i + chunkSize; j++)
      calls.push(j)
    i += chunkSize
    const poolMetas = await api.multiCall({
      target: poolHelpers[chain],
      abi: abi.poolMetas,
      calls,
    })
    for (const output of poolMetas) {
      if (output.tokenX === nullAddress && output.fee === '0') {
        foundLastPool = true
        break;
      }
      poolMetaData.push(output)
    }
  } while (!foundLastPool)

  const poolCalls = poolMetaData.map(i => ({ params: [i.tokenX, i.tokenY, i.fee] }))
  const pools = await api.multiCall({
    target: poolHelpers[chain],
    abi: abi.pool,
    calls: poolCalls,
  })

  pools.forEach((output, i) => toa.push([poolMetaData[i].tokenX, output], [poolMetaData[i].tokenY, output],))
  // if (chain === 'era') bTokens.push(ADDRESSES.arbitrum.WETH)
  return sumTokens2({ tokensAndOwners: toa, api, blacklistedTokens: bTokens, permitFailure: true})
}

Object.keys(poolHelpers).forEach(chain => {
  module.exports[chain] = { tvl }
})
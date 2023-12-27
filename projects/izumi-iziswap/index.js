const ADDRESSES = require('../helper/coreAssets.json')

let abi = require('./abi')
const { sumTokens2, } = require('../helper/unwrapLPs')

const nullAddress = ADDRESSES.null
const poolHelpers = {
  'bsc': ['0x93C22Fbeff4448F2fb6e432579b0638838Ff9581',
          '0xBF55ef05412f1528DbD96ED9E7181f87d8C9F453'],
  'arbitrum': ['0xAD1F11FBB288Cd13819cCB9397E59FAAB4Cdc16F'],
  'era': ['0x936c9A1B8f88BFDbd5066ad08e5d773BC82EB15F',
          '0x483FDE31bcE3DCc168E23a870831b50Ce2cCd1F1'],
  'meter': ['0x07aBf894D5C25E626bb30f75eFC728a1d86BEeDC',
            '0x579ffe4A5c8CB2C969aE4E65039B7dBb6951d164'],
  'aurora': ['0x61A41182CD6e94f2A026aE3c0D1b73B1AA579aEa',
            '0xE78e7447223aaED59301b44513D1d3A892ECF212'],
  // 'ethereumclassic': '0x1D377311b342633A970e71a787C50F83858BFC1B',
  'cronos': ['0x33531bDBFE34fa6Fd5963D0423f7699775AacaaF'],
  'polygon': ['0x1CB60033F61e4fc171c963f0d2d3F63Ece24319c'],
  // 'conflux': '0x1502d025BfA624469892289D45C0352997251728',
  'mantle': ['0x611575eE1fbd4F7915D0eABCC518eD396fF78F0c'],
  'ethereum': ['0x19b683A2F45012318d9B2aE1280d68d3eC54D663'],
  'ontology_evm': ['0x344ADD21b136B09051fb061881eC7971c92cE7f7'],
  'ultron' : ['0xAC9788cfea201950dB91d7db6F28C448CF3A4B29'],
  'linea': ['0x1CB60033F61e4fc171c963f0d2d3F63Ece24319c'],
  'kroma': ['0x110dE362cc436D7f54210f96b8C7652C2617887D'],  
  'manta': ['0x19b683A2F45012318d9B2aE1280d68d3eC54D663'],  
  'scroll': ['0x1502d025BfA624469892289D45C0352997251728'],
  'base': ['0x110dE362cc436D7f54210f96b8C7652C2617887D'],
} // iziswap liquidityManager contracts

const blacklistedTokens = [
  ADDRESSES.bsc.iUSD,
  '0x1382628e018010035999A1FF330447a0751aa84f',
]

const tvl = async (_, _1, _2, { api }) => {
  const chain = api.chain
  const toa = [] 
  const chunkSize = 10
  const bTokens = [...blacklistedTokens]
  const allPools = []
  const allPoolMetas = []

  for(const manager of poolHelpers[chain]) {
    let i = 1
    let foundLastPool = false
    const poolMetaData = []
    do {
      const calls = []
      for (let j = i; j < i + chunkSize; j++)
        calls.push(j)
      i += chunkSize
      const poolMetas = await api.multiCall({
        target: manager,
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
      target: manager,
      abi: abi.pool,
      calls: poolCalls,
    })

    allPools.push(...pools)
    allPoolMetas.push(...poolMetaData)
  }

  allPools.forEach((output, i) => toa.push([allPoolMetas[i].tokenX, output], [allPoolMetas[i].tokenY, output],))
  // if (chain === 'era') bTokens.push(ADDRESSES.arbitrum.WETH)
  return sumTokens2({ tokensAndOwners: toa, api, blacklistedTokens: bTokens, permitFailure: true})
}

Object.keys(poolHelpers).forEach(chain => {
  module.exports[chain] = { tvl }
})
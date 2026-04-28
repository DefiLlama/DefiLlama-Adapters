const ADDRESSES = require('../helper/coreAssets.json')

const PROJECT_CONTRACT = '0x47176B2Af9885dC6C4575d4eFd63895f7Aaa4790'
const PROJECT_CONTRACT_V2 = '0xDf1AC1AC255d91F5f4B1E3B4Aef57c5350F64C7A'

const BUILDERS = {
  arbitrum: {
    owner: '0xC0eD68f163d44B6e9985F0041fDf6f67c6BCFF3f',
  },
  base: {
    owner: '0x42BB446eAE6dca7723a9eBdb81EA88aFe77eF4B9',
    token: '0x7431aDa8a591C955a994a21710752EF9b882b8e3',
  },
}

const BUILDERS_DEPLOYMENTS = {
  arbitrum: { timestamp: 1777346391, block: 457098475 },
}

async function tvl(api) {
  const v2Deployment = +new Date('2025-09-17') / 1e3
  if (api.timestamp < v2Deployment) {
    return api.sumTokens({ owner: PROJECT_CONTRACT, tokens: [ADDRESSES.ethereum.STETH] })
  }

  const aaveContract = await api.call({ abi: 'address:aavePoolDataProvider', target: PROJECT_CONTRACT_V2 })
  const aTokens = await api.call({ abi: abi.getAllATokens, target: aaveContract })
  const uTokens = await api.call({ abi: abi.getAllReservesTokens, target: aaveContract })
  const tokens = [...new Set([
    ...aTokens.map(i => i.tokenAddress),
    ...uTokens.map(i => i.tokenAddress),
    ADDRESSES.ethereum.STETH,
  ])]
  return api.sumTokens({ owners: [PROJECT_CONTRACT_V2, PROJECT_CONTRACT], tokens })
}

function makeBuildersStaking(chain) {
  return async (api) => {
    const deploy = BUILDERS_DEPLOYMENTS[chain]
    if (deploy && (api.timestamp < deploy.timestamp || api.block < deploy.block)) return {}
    const builder = BUILDERS[chain]
    const token = builder.token || await api.call({ abi: 'address:depositToken', target: builder.owner })
    if (!token) throw new Error(`deposit token not found for ${builder.owner}`)
    return api.sumTokens({ owner: builder.owner, tokens: [token] })
  }
}

const abi = {
  getAllATokens: 'function getAllATokens() view returns ((string symbol, address tokenAddress)[])',
  getAllReservesTokens: 'function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])',
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Ethereum TVL counts stETH and Aave deposits held by Morpheus capital contracts. Arbitrum and Base staking count the balance of each chain\'s Builders deposit token and are reported under staking because the deposit asset is the protocol token.',
  start: '2024-02-08',
  ethereum: { tvl },
  arbitrum: { tvl: () => ({}), staking: makeBuildersStaking('arbitrum') },
  base: { tvl: () => ({}), staking: makeBuildersStaking('base') },
  hallmarks: [
    ['2024-04-06', 'MOR token launch'],
  ],
}

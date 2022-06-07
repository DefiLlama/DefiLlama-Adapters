const sdk = require("@defillama/sdk")
const { post } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')
const { sumTokens } = require("../helper/unwrapLPs")
const { getChainTransform, getFixBalances } = require("../helper/portedTokens")
const abi = require("../mooniswap/abi.json")

const query = factory => `query emiswapFactories {  emiswapFactories(where: {id: "${factory}"}) {    id    totalLiquidityUSD  }}`

const chainConfig = {
  ethereum: {
    factory: '0x1771dff85160768255F0a44D20965665806cBf48',
    url: 'https://api.thegraph.com/subgraphs/name/lombardi22/emiswap8'
  },
  kcc: {
    factory: '0x945316F2964ef5C6C84921b435a528DD1790E93a',
    url: 'https://thegraph.kcc.network/subgraphs/name/emiswap/emiswap1'
  },
  polygon: {
    factory: '0x23c1b313152e276e0CF61665dc3AC160b3c5aB19',
    url: 'https://api.thegraph.com/subgraphs/name/lombardi22/polygon',
  },
  shiden: {
    factory: '0x7449314B698f918E98c76279B5570613b243eECf',
    url: 'https://shiden-graph.emiswap.com/subgraphs/name/shiden',
  },
  avax: {
    factory: '0xaD6b9b31832A88Bb59dB4ACD820F8df2CfA84f0f',
  },
  astar: {
    factory: '0xb4BcA5955F26d2fA6B57842655d7aCf2380Ac854',
  },
  aurora: {
    factory: '0x979e5d41595263f6Dfec4F4D48419C555B80D95c',
    url: 'https://api.thegraph.com/subgraphs/name/lombardi22/aurora',
  },
}


const moduleExports = {}

Object.keys(chainConfig).forEach(chain => {
  const { factory, url } = chainConfig[chain]
  async function tvl() {
    const body = { query: query(factory), operationName: "emiswapFactories", variables: {} }
    const response = await post(url, body)
    return toUSDTBalances(response.data.emiswapFactories[0].totalLiquidityUSD)
  }

  async function computeTvl(ts, _block, chainBlocks) {
    const balances = {}
    const block = chainBlocks[chain]
    const transformAddress = await getChainTransform(chain)
    const fixBalances = await getFixBalances(chain)

    const getAllpools = (await sdk.api.abi.call({ abi: abi.getAllPools, target: factory, block, chain, })).output
    const getTokens = (await sdk.api.abi.multiCall({ abi: abi.getTokens, calls: getAllpools.map(pool => ({ target: pool })), block, chain, })).output
    const tokensAndOwners = []
    getTokens.forEach(({ output: tokens }, i) => {
      const owner = getAllpools[i]
      tokens.forEach(token => tokensAndOwners.push([token, owner]))
    })

    await sumTokens(balances, tokensAndOwners, block, chain, transformAddress)
    fixBalances(balances)
    return balances
  }

  moduleExports[chain] = { tvl: url ? tvl : computeTvl }
})
const eswToken = "0x5a75a093747b72a0e14056352751edf03518031d";
const stakingPool = "0xe094E3E16e813a40E2d6cC4b89bfeAe0142044e1";

async function ethStaking(timestamp, block) {
  let balances = {};

  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: eswToken,
    owner: stakingPool,
    block,
  });
  sdk.util.sumSingleBalance(balances, eswToken, balance);

  return balances;
}

moduleExports.ethereum.staking = ethStaking

module.exports = {
  methodology: "ETH and KCC TVL are the total liquidity from the LPs according to the subgraph. Staking TVL would be ESW value in the staking pool.",
  ...moduleExports
};
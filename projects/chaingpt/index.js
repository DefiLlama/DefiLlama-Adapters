const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");
const { getLogs } = require('../helper/cache/getLogs')

const cgpt = "0x9840652DC04fb9db2C43853633f0F62BE6f00f98";
const stakingpool1 = "0x765a6ee976137801F2661c3644E1fde369A8ED18";
const stakingpool2 = "0x62A402DEf6Ca37E9CA7a544bE34954748088CCEE";
const stakingpool3 = "0x6eE8D743Eb8bEc665AaCdb535f2F100f040Ca6C5";
const rewardWallet = "0x28FBFA75850E246BdD454A0e76FeAA42D771757B";

const chainContracts = {
  1: {
    factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A',
    fromBlock: 17003869
  }, 
  137: {
    factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A',
    fromBlock: 45136100
  }, 
  56: {
    factory: '0xc263365D628568C23d61BDDa24C8EB27CEF4E917',
    fromBlock: 30004999
  },
  42161: {
    factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A',
    fromBlock: 111699000
  }, 
  43114: {
    factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A',
    fromBlock: 32665049
  }

}

async function tvl(api) {
  const factory0 = '0xfb8c571f7152d2e092b0e650731c4d599cd514e1'
  const factory = '0xc263365D628568C23d61BDDa24C8EB27CEF4E917'
  const logs = await getLogs({
    api,
    target: factory0,
    eventAbi: 'event PresalePoolCreated (address token, uint256 openTime, uint256 closeTime, address offeredCurrency, uint256 offeredCurrencyDecimals, uint256 offeredCurrencyRate, address wallet, address owner)',
    fromBlock: 30004999,
  })

  const logs2 = await getLogs({
    api,
    target: factory,
    eventAbi: 'event PresalePoolCreated (address registedBy, address indexed token, address indexed pool, uint256 poolId)',
    fromBlock: 30004999,
  })
  const ownerTokens = []
  const poolTokenMapping = {}
  logs.forEach(({ args: i}) => {
    const key = i.token+'-'+i.owner
    if (!poolTokenMapping[key]) poolTokenMapping[key] = []
    poolTokenMapping[key].push(i.offeredCurrency)
  })
  logs2.forEach(({ args: i}) => {
    const key = i.token+'-'+i.registedBy
    if (!poolTokenMapping[key]) {
      return;
    }
    ownerTokens.push([poolTokenMapping[key], i.pool])
  })
  return api.sumTokens({ ownerTokens })
}



async function tvlFunc(api) {
  const factory = chainContracts[api.chainId]?.factory
  const fromBlock = chainContracts[api.chainId]?.fromBlock

  const logs2 = await getLogs({
    api,
    target: factory,
    eventAbi: 'event PresalePoolCreated (address registedBy, address indexed token, address indexed pool, uint256 poolId)',
    fromBlock: fromBlock,
  })
  const pools = []
  logs2.forEach(({ args: i }) => {
    pools.push(i.pool)
  })

  const ownerTokens = []
  const poolTokenMapping = {}

  for (const pool of pools) {
    try {
      const logs = await getLogs({
        api,
        target: pool,
        eventAbi: 'event PresalePoolCreated (address token, uint256 openTime, uint256 closeTime, address offeredCurrency, uint256 offeredCurrencyDecimals, uint256 offeredCurrencyRate, address wallet, address owner)',
        fromBlock: fromBlock,
      })
      logs.forEach(({ args: i }) => {
        const key = i.token + '-' + i.owner
        if (!poolTokenMapping[key]) poolTokenMapping[key] = []
        poolTokenMapping[key].push(i.offeredCurrency)
      })
    } catch (error) {
      console.log(error)
    }
  }

  logs2.forEach(({ args: i }) => {
    const key = i.token + '-' + i.registedBy
    if (!poolTokenMapping[key]) {
      return;
    }
    ownerTokens.push([poolTokenMapping[key], i.pool])
  })
  return api.sumTokens({ ownerTokens })

}


module.exports = {
  ethereum: {
    tvl: tvlFunc
  },
  polygon: {
    tvl: tvlFunc
  },
  arbitrum: {
    tvl: tvlFunc
  },
  avax: {
    tvl: tvlFunc
  },
  bsc: {
    tvl: tvlFunc,
    staking: stakings([stakingpool1, stakingpool2, stakingpool3, rewardWallet], cgpt),
  },
};
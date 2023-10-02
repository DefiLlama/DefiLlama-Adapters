const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");
const { getLogs } = require('../helper/cache/getLogs')

const cgpt = "0x9840652DC04fb9db2C43853633f0F62BE6f00f98";
const stakingpool1 = "0x765a6ee976137801F2661c3644E1fde369A8ED18";
const stakingpool2 = "0x62A402DEf6Ca37E9CA7a544bE34954748088CCEE";

async function tvl(_, _b, _cb, { api, }) {
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
  console.log(logs.length, logs2.length)
  logs.forEach(({ args: i}) => {
    const key = i.token+'-'+i.owner
    console.log(key, i.offeredCurrency)
    if (!poolTokenMapping[key]) poolTokenMapping[key] = []
    poolTokenMapping[key].push(i.offeredCurrency)
  })
  console.log(poolTokenMapping)
  logs2.forEach(({ args: i}) => {
    const key = i.token+'-'+i.registedBy
    if (!poolTokenMapping[key]) {
      console.log('missing mapping for ', key)
      return;
    }
    ownerTokens.push([poolTokenMapping[key], i.pool])
  })
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  bsc: {
    tvl,
    staking: stakings([stakingpool1, stakingpool2], cgpt),
  },
};
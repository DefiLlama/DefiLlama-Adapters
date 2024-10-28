const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs');

const corePool = '0x5e69d826D3663094321E2cf3C387b7F9Dd7b44Bb'

async function tvl(api) {
    let poolLogs = (await Promise.all([
        getLogs({ api, target: corePool, topic: 'LOG_NEW_POOL(address,address)', fromBlock: 18756776, }),
    ])).flat()

    const balances = {}

    let pools = poolLogs.map((poolLog) => `0x${poolLog.topics[2].slice(26)}`)

    const poolTokenData = api.multiCall({ calls: pools, abi: "address[]:getCurrentTokens", })
    poolTokenData.forEach((token, index) => {
        const accountBalances = api.multiCall({  abi: 'address:getBalance', calls: token})
        sdk.util.sumSingleBalance(balances, poolTokenData[index].toString(), accountBalances)
    })
   
    return balances
}

module.exports = {
    doublecounted: true,
    core: {
      tvl,
    },
  };
const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

const corePool = '0x5e69d826D3663094321E2cf3C387b7F9Dd7b44Bb'

async function tvl(api) {
    let poolLogs = (await Promise.all([
        getLogs({ api, target: '0x5e69d826D3663094321E2cf3C387b7F9Dd7b44Bb', topic: 'LOG_NEW_POOL(address,address)', fromBlock: 18756776, }),
    ])).flat()

    let pools = poolLogs.map((poolLog) => `0x${poolLog.topics[2].slice(26)}`)

    const poolTokenData = await api.multiCall({ calls: pools, abi: "address[]:getCurrentTokens", })
    const ownerTokens = poolTokenData.map((v, i) => [v, pools[i]])
    console.log('ownerTokens', ownerTokens)
    await sumTokens2({ ownerTokens, api })
    return api.getBalances()
}

module.exports = {
    doublecounted: true,
    core: {
      tvl,
    },
  };
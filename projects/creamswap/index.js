const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(api) {
  let poolLogs = (await Promise.all([
    getLogs({ api, target: '0xf8062Eedf80D8D2527cE89435f670cb996aB4e54', topic: 'LOG_NEW_POOL(address,address)', fromBlock: 10815298, }),
    getLogs({ api, target: '0x136d6F80Bb3A853D151686BFED2c9309Aea6dDec', topic: 'LOG_NEW_POOL(address,address)', fromBlock: 11053389, }),
    getLogs({ api, target: '0x0d3303Ffaf107cD732396570Bf07b2dbd79B619f', topic: 'LOG_NEW_POOL(address,address)', fromBlock: 11099537, })
  ])).flat()

  let pools = poolLogs.map((poolLog) => `0x${poolLog.topics[2].slice(26)}`)

  const poolTokenData = await api.multiCall({ calls: pools, abi: "address[]:getCurrentTokens", })
  const ownerTokens = poolTokenData.map((v, i) => [v, pools[i]])
  return sumTokens2({ ownerTokens, api })
}

module.exports = {
  start: '2020-09-08', // 09/08/2020 @ 8:00am (UTC)
  ethereum: { tvl }
}

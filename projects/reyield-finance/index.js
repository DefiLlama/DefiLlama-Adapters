const ABI = require('./abi.json')

const positionManagerFactory = "0x3332Ae0fC25eF24352ca75c01A1fCfd9fc33EAca"
const positionHelper = "0x76136A56963740b4992C5E9dA5bB58ECffC92ce3"

async function tvl(api) {
  const { managers } = await api.call({
    target: positionManagerFactory,
    abi: ABI.getPositionManagers,
    params: [0, 1000000],
  })

  const owners = await api.multiCall({ abi: ABI.getOwner, calls: managers, })
  const counters = await api.multiCall({ abi: ABI.positionIdCounter, calls: managers, })

  await Promise.all(managers.map(async (manager, i) => {
    const owner = owners[i]
    const calls = []
    for (let pid = 1; pid <= counters[i]; pid++) {
      calls.push({ params: [owner, pid] })
    }
    if (!calls.length) return;

    const liquidity = await api.multiCall({ abi: ABI.getAmounts, calls, target: positionHelper })
    const fees = await api.multiCall({ abi: ABI.getUncollectedFees, calls, target: positionHelper })
    liquidity.forEach(addValue)
    fees.forEach(addValue)
  }))

  return api.getBalances()

  function addValue(i) {
    api.add(i.token0, i.amount0)
    api.add(i.token1, i.amount1)
  }
}

const chains = [
  'optimism',
  'polygon',
]

module.exports = {
  start: '2023-09-28', // Sep-28-2023 03:59:38 AM +UTC
  doublecounted: true,
  methodology: "TVL is equal to users' running positions' liquidity value plus uncollected fees.",
};

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})

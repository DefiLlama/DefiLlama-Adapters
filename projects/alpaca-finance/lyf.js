const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function getProcolAddresses(chain) {
  if (chain == 'bsc') {
    return (
      await getConfig('alpaca-finance/lyf-bsc',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.mainnet.json"
      )
    )
  }
  if (chain == 'fantom') {
    return (
      await getConfig('alpaca-finance/lyf-fantom',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.fantom_mainnet.json"
      )
    )
  }
}

// count what the workers hold (user equity + borrowed), idle vault balances are counted by alpaca-finance-lend
async function calLyfTvl(api) {
  const addresses = await getProcolAddresses(api.chain);
  const workers = addresses["Vaults"].flatMap(v => v.workers)
  const lpWorkers = workers.filter(w => !w.name.includes("CakeMaxiWorker"))
  const cakeMaxiWorkers = workers.filter(w => w.name.includes("CakeMaxiWorker"))

  const lpInfos = await api.multiCall({
    abi: 'function userInfo(uint256, address) view returns (uint256 amount)',
    calls: lpWorkers.map(w => ({ target: w.stakingTokenAt, params: [w.pId, w.address] })),
    permitFailure: true,
  })
  lpInfos.forEach((amount, i) => { if (amount) api.add(lpWorkers[i].stakingToken, amount) })

  if (cakeMaxiWorkers.length) {
    const shares = await api.multiCall({
      abi: 'function userInfo(address) view returns (uint256 shares)',
      calls: cakeMaxiWorkers.map(w => ({ target: w.stakingTokenAt, params: [w.address] })),
      permitFailure: true,
    })
    const prices = await api.multiCall({ abi: 'uint256:getPricePerFullShare', calls: cakeMaxiWorkers.map(w => w.stakingTokenAt), permitFailure: true })
    cakeMaxiWorkers.forEach((w, i) => { if (shares[i] && prices[i]) api.add(w.stakingToken, shares[i] * prices[i] / 1e18) })
  }

  return sumTokens2({ api, resolveLP: true })
}

module.exports = {
  calLyfTvl,
  getProcolAddresses
}

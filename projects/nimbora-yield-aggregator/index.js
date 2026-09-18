const ADDRESSES = require('../helper/coreAssets.json')
const { multiCall, parseAddress } = require('../helper/chain/starknet')
const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

const totalAssetsAbi = {
  "name": "total_assets",
  "type": "function",
  "inputs": [],
  "outputs": [
    {
      "name": "totalAssets",
      "type": "Uint256"
    }
  ],
  "stateMutability": "view"
}

async function fetcher() {
  return get('https://stats.nimbora.io/aggregator/strategies', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  })
}

async function tvl(api) {
  const strategyData = await getConfig('nimbora-yield-aggregator', undefined, { fetcher })
  const strategyTvls = await multiCall({ calls: strategyData.map(s => s.vault), abi: totalAssetsAbi })
  strategyData.forEach((strategyInfo, index) => {
    const underlying = parseAddress(strategyInfo.underlying);
    api.add(underlying, strategyTvls[index])
  })
}

module.exports = {
  methodology: 'Computed by summing the total assets held by each vault aggregator.',
  starknet: {
    tvl
  },
}

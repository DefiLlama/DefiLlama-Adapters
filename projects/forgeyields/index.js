const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json');
const { multiCall } = require('../helper/chain/starknet');

const starknetTotalAssetsABI = {
  "type": "function",
  "name": "total_assets",
  "inputs": [
      {
          "name": "token_gateway",
          "type": "core::starknet::contract_address::ContractAddress"
      }
  ],
  "outputs": [
      {
          "type": "core::integer::u256"
      }
  ],
  "state_mutability": "view",
  "customInput": "address"
}

async function fetcher() {
  const apiUrl = 'https://api.forgeyields.com/strategies'
  return get(apiUrl)
}

const totalAssetsProviderStarknet = "0x2d0ee5bf4445712c414d58544c9d522a537e4292fa3c3ad36e68bd177a378b8"
const totalAssetsProviderEthereum = "0x5d77Ef1B3e419ceca9e48be33B6600F997993DD6"

async function starknetTvl(api) {
  const strategies = await getConfig('forgeyields', undefined, { fetcher })

  const calls = strategies
    .map(strategyInfo => {
      const tokenGateway = strategyInfo.token_gateway_per_domain
        .find(domain => domain.domain === 'starknet')
        ?.token_gateway;
      return {
        abi: starknetTotalAssetsABI,
        target: totalAssetsProviderStarknet,
        params: [tokenGateway]
      }
    })
    .filter(call => call.params[0])

  const totalAssets = await multiCall({ calls })

  let callIndex = 0
  for (const strategyInfo of strategies) {
    const tokenGateway = strategyInfo.token_gateway_per_domain
      .find(domain => domain.domain === 'starknet')
      ?.token_gateway;

    if (tokenGateway) {
      const underlying = ADDRESSES.starknet[strategyInfo.underlyingSymbol]
      api.add(underlying, totalAssets[callIndex])
      callIndex++
    }
  }
}

async function ethereumTvl(api) {
  const strategies = await getConfig('forgeyields', undefined, { fetcher })

  const gateways = strategies
    .map(s => {
      const gw = s.token_gateway_per_domain
        .find(d => d.domain === 'ethereum')
        ?.token_gateway;
      return gw ? { address: gw, underlyingSymbol: s.underlyingSymbol } : null
    })
    .filter(Boolean)

  const totalAssets = await api.multiCall({
    abi: 'function totalAssets(address tokenGateway) view returns (uint256)',
    target: totalAssetsProviderEthereum,
    calls: gateways.map(g => g.address),
  })

  gateways.forEach((g, i) => {
    const symbol = g.underlyingSymbol === 'ETH' ? 'WETH' : g.underlyingSymbol
    const underlying = ADDRESSES.ethereum[symbol]
    if (underlying) api.add(underlying, totalAssets[i])
  })
}

module.exports = {
  methodology: 'Compute the total assets under management for each strategy.',
  starknet: {
    tvl: starknetTvl,
  },
  ethereum: {
    tvl: ethereumTvl,
  },
}

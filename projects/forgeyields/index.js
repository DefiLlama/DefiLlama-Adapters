const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json');
const { call } = require('../helper/chain/starknet');

const totalAssetsABI = {
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

const totalAssetsProvider = "0x2d0ee5bf4445712c414d58544c9d522a537e4292fa3c3ad36e68bd177a378b8"

async function tvl(api) {
  const strategies = await getConfig('forgeyields', undefined, { fetcher })
  for (let index = 0; index < strategies.length; index++) {
    const strategyInfo = strategies[index];
    const tokenGateway = strategyInfo.token_gateway_per_domain
    .find(domain => domain.domain === 'starknet')
    ?.token_gateway;
    const totalAssets = await call({
      abi: totalAssetsABI,
      target: totalAssetsProvider,
      params: [tokenGateway]
    });
    const underlying = ADDRESSES.starknet[strategyInfo.underlyingSymbol]
    api.add(underlying, totalAssets)
  }
}
module.exports = {
  methodology: 'Compute the total assets under management for each strategy.',
  starknet: {
    tvl
  },
}

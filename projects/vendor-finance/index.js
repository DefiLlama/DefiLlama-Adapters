const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0x17a6639825270a6a0f6172df6127d5ca0ef5649412ba2ae4225acd2b584425ca'],
    fromBlock,
    eventAbi: 'event DeployPool (address _poolAddress, address _deployer, uint256 _mintRatio, address _colToken, address _lendToken, uint48 _protocolFee, uint48 _protocolColFee, uint48 _expiry, address[] _borrowers)'
  })

  const balances = {};
  const tokensAndOwners = []

  for (const { args: { _poolAddress, _colToken, _lendToken, _expiry } } of logs) {
    if (_expiry < api.timestamp) continue;
    tokensAndOwners.push([_colToken, _poolAddress])
    tokensAndOwners.push([_lendToken, _poolAddress])
  }

  return sumTokens2({ tokensAndOwners, api, balances, });
}

const config = {
  arbitrum: { factory: '0xf0dbf74cef39e5cd4e54d0ffd59075024c7d8857', fromBlock: 20274088, },
  ethereum: { factory: '0x928cf648069082D9AEf25ddB2bF10D25bf1C1D73', fromBlock: 16545630, },
}

module.exports = {
  methodology: 'The sum of the balance of all listed collateral and lend tokens in all deployed pools.',
  deadFrom: '2024-08-30'
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
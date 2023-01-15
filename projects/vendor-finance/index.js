const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(timestamp, block, chainBlocks, { api }) {
  const logs = await getLogs({
    api,
    target: '0xf0dbf74cef39e5cd4e54d0ffd59075024c7d8857',
    topics: ['0x17a6639825270a6a0f6172df6127d5ca0ef5649412ba2ae4225acd2b584425ca'],
    fromBlock: 20274088,
    eventAbi: 'event DeployPool (address _poolAddress, address _deployer, uint256 _mintRatio, address _colToken, address _lendToken, uint48 _protocolFee, uint48 _protocolColFee, uint48 _expiry, address[] _borrowers)'
  })

  block = chainBlocks.arbitrum;
  const balances = {};
  const tokensAndOwners = []

  for (const { args: { _poolAddress, _colToken, _lendToken, _expiry }} of logs) {
    if (_expiry < timestamp) continue;
    tokensAndOwners.push([_colToken, _poolAddress])
    tokensAndOwners.push([_lendToken, _poolAddress])
  }

  return sumTokens2({ tokensAndOwners, api, balances, });
}

module.exports = {
  methodology: 'The sum of the balance of all listed collateral and lend tokens in all deployed pools.',
  start: 20274088,
  arbitrum: {
    tvl 
  }
}; 
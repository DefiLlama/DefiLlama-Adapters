  const _ = require('underscore');
  const sdk = require('@defillama/sdk');
  const abi = require('./abi.json');

const START_BLOCK = 12093712; // block 12093712, Mar-23-2021 07:22:04 AM +UTC
const VAULT_FACTORY_PROXY = '0x3269DeB913363eE58E221808661CfDDa9d898127';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

  async function tvl(timestamp, block) {
    let balances = {};
    balances[USDC] = 0;

    let vaults = await getVaults(block);

    let vaultBalances = await sdk.api.abi.multiCall({
      block,
      calls: _.map(vaults, (vault) => ({
        target: USDC,
        params: vault,
      })),
      abi: 'erc20:balanceOf',
    });

    sdk.util.sumMultiBalanceOf(balances, vaultBalances);

    return balances;
  }

  async function getVaults(block) {
    if (block < START_BLOCK) {
      return [];
    }

    return (await sdk.api.abi.call({
      block,
      target: VAULT_FACTORY_PROXY,
      params: [],
      abi: abi['getAllVaults'],
    })).output;
  }

  module.exports = {
    start: START_BLOCK,
    tvl
  }

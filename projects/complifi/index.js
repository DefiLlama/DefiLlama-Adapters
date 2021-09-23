const _ = require('underscore');
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const chainParams = {
  ethereum: {
    START_BLOCK: 12093712, // block 12093712, Mar-23-2021 07:22:04 AM +UTC
    VAULT_FACTORY_PROXY: '0x3269DeB913363eE58E221808661CfDDa9d898127',
  },
  polygon:{
    START_BLOCK: 14908452,
    VAULT_FACTORY_PROXY: '0xE970b0B1a2789e3708eC7DfDE88FCDbA5dfF246a',
  }
}


function getChainTvl(chain){
  return async (timestamp, block, chainBlocks)=>chainTvl(chain, chainBlocks[chain], chain=='ethereum'?addr=>addr:addr=>`polygon:${addr}`)
}

async function chainTvl(chain, block, transformAddr) {
  let balances = {};

  let vaults = await getVaults(block, chain);

  let vaultCollaterals = (await sdk.api.abi.multiCall({
    block,
    calls: _.map(vaults, (vault) => ({
      target: vault,
    })),
    chain,
    abi: abi['getVaultCollateral'],
  })).output;

  let vaultBalances = await sdk.api.abi.multiCall({
    block,
    calls: _.map(vaults, (vault,index) => ({
      target: vaultCollaterals[index].output,
      params: vault,
    })),
    chain,
    abi: 'erc20:balanceOf',
  });

  sdk.util.sumMultiBalanceOf(balances, vaultBalances, true, transformAddr);

  return balances;
}

async function getVaults(block, chain) {
  if (block < chainParams[chain].START_BLOCK) {
    return [];
  }

  return (await sdk.api.abi.call({
    block,
    chain,
    target: chainParams[chain].VAULT_FACTORY_PROXY,
    params: [],
    abi: abi['getAllVaults'],
  })).output;
}

module.exports = {
  ethereum:{
    tvl: getChainTvl('ethereum')
  },
  polygon: {
    tvl: getChainTvl('polygon')
  },
  tvl: sdk.util.sumChainTvls([getChainTvl('ethereum'), getChainTvl('polygon')])
}

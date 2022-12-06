const sdk = require('@defillama/sdk');
const { Axios, default: axios } = require('axios');
const { getBlock } = require('../helper/getBlock');
const { transformBscAddress, transformAvaxAddress } = require('../helper/portedTokens')
const { getChainTransform } = require('../helper/portedTokens')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');
const { fetchURL } = require('../helper/utils');


// const stakings = addresses.stakings;
// const bridges = addresses.bridges;
// const multisig = addresses.multisigs;


function tvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const resp = await fetchURL('http://live.carbon.financial/tvl');
    const addresses = resp.data

    const stakings = addresses.stakings;
    const bridges = addresses.bridges;
    const multisig = addresses.multisigs;

    const block = await getBlock(timestamp, chain, chainBlocks, true);
    const balances = {};
    
    let multisigList = multisig[chain];


    if(chain == 'ethereum'){
      //get addresses here
      let tokensList = [];
      let importedTokens = addresses.tokens.ethereum.token;
      let importedLpTokens = addresses.tokens.ethereum.lpToken;

      for (var key in importedTokens){
        let tokenAddress = importedTokens[key]
        tokensList.push([tokenAddress, false]);
      }
      for (var key in importedLpTokens){
        let tokenAddress = importedLpTokens[key];
        tokensList.push([tokenAddress, true]);
      }

      await sumTokensAndLPsSharedOwners(
        balances,
        tokensList,
        [bridges[chain], stakings[chain], multisigList.rbx, multisigList.rbxs],
        block
      );
    }
    
    if(chain == 'bsc'){
      const transform = await transformBscAddress();
      let tokensList = [];
      let importedTokens = addresses.tokens.bsc.token;
      let importedLpTokens = addresses.tokens.bsc.lpToken;

      for (var key in importedTokens){
        let tokenAddress = importedTokens[key]
        tokensList.push([tokenAddress, false]);
      }
      for (var key in importedLpTokens){
        let tokenAddress = importedLpTokens[key];
        tokensList.push([tokenAddress, true]);
      }

      await sumTokensAndLPsSharedOwners(
        balances,
        tokensList,
        [bridges[chain], stakings[chain], multisigList.rbx],
        block, 
        'bsc',
        transform
      );
    }
    
    if(chain == 'avax'){
      const transform = await transformAvaxAddress();
      let tokensList = [];
      let importedTokens = addresses.tokens.avax.token;
      let importedLpTokens = addresses.tokens.avax.lpToken;

      for (var key in importedTokens){
        let tokenAddress = importedTokens[key]
        tokensList.push([tokenAddress, false]);
      }
      for (var key in importedLpTokens){
        let tokenAddress = importedLpTokens[key];
        tokensList.push([tokenAddress, true]);
      }

      await sumTokensAndLPsSharedOwners(
        balances,
        tokensList,
        [bridges[chain], multisigList.rbx],
        block,
        'avax',
        transform
      );
    }
    
    return balances
  }
  
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'calculates RBX TVL on all chains.',
  start: 1000235,
  ethereum: {
    tvl: tvl('ethereum'),
  },
  bsc: {
    tvl: tvl('bsc'),
  },
  avax: {
    tvl: tvl('avax')
  }
};
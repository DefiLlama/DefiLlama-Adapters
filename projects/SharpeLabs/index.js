const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const StEthVaultContract = '0xfc85db895e070017ab9c84cb65b911d56b729ee9';

// function to return TVL of magnum
async function tvl(api) {
  const balances = {};

  // get balance of eth 
  const EthBalance = await api.call({
    abi: 'function getVaultsActualBalance() public view returns(uint amount)',
    target: StEthVaultContract,
  });
    
  return {
    ['ethereum:' + ADDRESSES.null]: EthBalance
  };
}

module.exports = {
      methodology: 'counts the Eth amount of by substracting Supplied stEth amount of vault by borrowed Weth of vault',
  ethereum: {
    tvl,
  }
}; 
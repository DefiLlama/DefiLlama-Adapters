const sdk = require('@defillama/sdk');
const StEthVaultContract = '0xfc85db895e070017ab9c84cb65b911d56b729ee9';

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const EthBalance = await api.call({
    abi: 'function getVaultsActualBalance() public view returns(uint amount)',
    target: StEthVaultContract,
  });
    
  return {
    'ethereum:0x0000000000000000000000000000000000000000': EthBalance
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the Eth amount of by substracting Supplied stEth amount of vault by borrowed Weth of vault',
  ethereum: {
    tvl,
  }
}; 
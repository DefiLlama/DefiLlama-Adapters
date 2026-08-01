const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const bridgeAddresses = {
  stETH: { tokenAddress: ADDRESSES.ethereum.STETH, ownerContractAddress: '0xfE08D40Eee53d64936D3128838867c867602665c' },
  sUSDS: { tokenAddress: ADDRESSES.ethereum.sUSDS, ownerContractAddress: '0x7cd01d5cad4ba0caeba02583a5c61d35b23e08eb' },
}

// Convert the object to an array of [tokenAddress, ownerContractAddress] pairs
const tokensAndOwners = Object.values(bridgeAddresses).map(({ tokenAddress, ownerContractAddress }) =>
  [tokenAddress, ownerContractAddress]
);

module.exports = {
  methodology: "TVL is calculated by getting all tokens in the AO bridge and adding up the USD values provided by CoinGecko.",
  ethereum: {
    tvl: async (api) => {
      await sumTokens2({ api, tokensAndOwners })
      // DAI bridge TVL is tracked via the manager's totalDepositedInPublicPools.
      const daiDeposited = await api.call({
        target: '0x6A1B588B0684dACE1f53C5820111F400B3dbfeBf',
        abi: 'uint256:totalDepositedInPublicPools',
      })
      api.add(ADDRESSES.ethereum.DAI, daiDeposited)
    },
  }
};

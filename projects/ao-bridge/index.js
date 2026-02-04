const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const bridgeAddresses = {
    stETH: { tokenAddress: ADDRESSES.ethereum.STETH, ownerContractAddress: '0xfE08D40Eee53d64936D3128838867c867602665c' },
}

// Convert the object to an array of [tokenAddress, ownerContractAddress] pairs
const tokensAndOwners = Object.values(bridgeAddresses).map(({ tokenAddress, ownerContractAddress }) =>
    [tokenAddress, ownerContractAddress]
);
const SUSDS_OWNER = '0x7cd01d5cad4ba0caeba02583a5c61d35b23e08eb'

module.exports = {
    methodology: "TVL is calculated by getting all tokens in the AO bridge and adding up the USD values provided by CoinGecko.",
    ethereum: {
        tvl: async (api) => {
            await sumTokens2({ api, tokensAndOwners })
            // sUSDS is a vault token; convert shares to underlying USDS via totalAssets/totalSupply.
            const [susdsShares, totalAssets, totalSupply] = await Promise.all([
                api.call({
                    target: ADDRESSES.ethereum.sUSDS,
                    abi: 'erc20:balanceOf',
                    params: SUSDS_OWNER,
                }),
                api.call({ target: ADDRESSES.ethereum.sUSDS, abi: 'uint256:totalAssets' }),
                api.call({ target: ADDRESSES.ethereum.sUSDS, abi: 'erc20:totalSupply' }),
            ])
            if (totalSupply > 0) {
                const usdsAssets = (susdsShares * totalAssets) / totalSupply
                api.add(ADDRESSES.ethereum.USDS, usdsAssets)
            }
            // DAI bridge TVL is tracked via the manager's totalDepositedInPublicPools.
            const daiDeposited = await api.call({
                target: '0x6A1B588B0684dACE1f53C5820111F400B3dbfeBf',
                abi: 'uint256:totalDepositedInPublicPools',
            })
            api.add(ADDRESSES.ethereum.DAI, daiDeposited)
            return api.getBalances()
        },
    }
};

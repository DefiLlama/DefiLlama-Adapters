const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const bridgeAddresses = {
    'stETH': { tokenAddress: ADDRESSES.ethereum.STETH, ownerContractAddress: '0xfE08D40Eee53d64936D3128838867c867602665c' }
}

// Convert the object to an array of [tokenAddress, ownerContractAddress] pairs
const tokensAndOwners = Object.values(bridgeAddresses).map(({ tokenAddress, ownerContractAddress }) =>
    [tokenAddress, ownerContractAddress]
);

module.exports = {
    methodology: "TVL is calculated by getting all tokens in the AO bridge and adding up the USD values provided by CoinGecko.",
    ethereum: {
        tvl: sumTokensExport({
            tokensAndOwners
        }),
    }
};
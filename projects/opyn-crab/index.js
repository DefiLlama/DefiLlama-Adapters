const { post } = require('../helper/http')
const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");

const ETH = '0x0000000000000000000000000000000000000000';

// to add TVL under yield category
async function tvl(timestamp, block, _, { api }){
    let balances = {};

    const API_URLS = {
        ethereum: 'https://api.thegraph.com/subgraphs/name/opynfinance/squeeth'
    };
    // get eth usd price
    const key = 'ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';      
    const ethPriceUSD = (await post("https://coins.llama.fi/prices", {
        "coins": [key]
    })).coins[key].price;
    // get eth usd price
    const squeethKey = 'ethereum:0xf1b99e3e573a1a9c5e6b2ce818b617f0e664e86b';
    const squeethPriceUSD = (await post("https://coins.llama.fi/prices", {
        "coins": [squeethKey]
    })).coins[squeethKey].price;

    // crab strategy vault in squeeth
    const crabVaultQuery = gql`
        query Vault($vaultID: ID! = 286) {
            vault(id: $vaultID) {
            id
            shortAmount
            collateralAmount
            NftCollateralId
            owner {
                id
            }
            operator
            }
        }
    `;
    const crabVaultQueryData = await Promise.all(
        Object.entries(API_URLS).map(async ([chain, url]) => [
            chain,
            (await request(url, crabVaultQuery)).vault,
        ])
    );

    const balance = crabVaultQueryData[0][1].collateralAmount - (crabVaultQueryData[0][1].shortAmount * (squeethPriceUSD / ethPriceUSD ));
    balances = {
        [ETH]: BigNumber(balances[ETH] || 0).plus(balance).toFixed(0),
    };

    return balances;
}

module.exports = {
  ethereum: {
    tvl: tvl
  }
};
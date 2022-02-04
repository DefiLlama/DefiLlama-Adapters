const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');
const { transformPolygonAddress, transformFantomAddress } = require("../helper/portedTokens");

async function ethtvl(timestamp, block) {
    let balances = {};

    const Contracts = {
      ethereum : {
        vaultCore: ['0x4026BdCD023331D52533e3374983ded99CcBB6d4'],
        collaterals: [
          ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', false], //wETH
          ['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', false], //wBTC
          ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', false], //USDC
        ],
      },
    };

    await sumTokensAndLPsSharedOwners(balances, Contracts.ethereum.collaterals, Contracts.ethereum.vaultCore, block, "ethereum");

return balances

}

async function polytvl(timestamp, block) {
  let balances = {};

  const Contracts = {
    
    polygon: {
      vaultCore: ['0x03175c19cb1d30fa6060331a9ec181e04cac6ab0'],
      collaterals: [
        ['0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', false], //wMATIC
        ['0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', false], //wETH
        ['0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', false], //wBTC
        ['0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', false], //USDC
      ],
    },
  };
    
  await sumTokensAndLPsSharedOwners(balances, Contracts.polygon.collaterals, Contracts.polygon.vaultCore, block, "polygon", await transformPolygonAddress());

return balances

}

async function ftmtvl(timestamp, block) {
  let balances = {};

  const Contracts = {
    
    fantom: {
      vaultCore: ['0xB2b4feB22731Ae013344eF63B61f4A0e09fa370e'],
      collaterals:[
        ['0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', false], //wFTM
        ['0x74b23882a30290451A17c44f4F05243b6b58C76d', false], //ETH
        ['0x321162Cd933E2Be498Cd2267a90534A804051b11', false], //BTC
        ['0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', false], //USDC
      ],
    }
  };

  
  await sumTokensAndLPsSharedOwners(balances, Contracts.fantom.collaterals, Contracts.fantom.vaultCore, block, "fantom", await transformFantomAddress());

return balances

}

module.exports = {
  ethereum:{
    tvl: ethtvl,
  },
  polygon:{
    tvl: polytvl,
  },
  fantom:{
    tvl: ftmtvl
  }
}

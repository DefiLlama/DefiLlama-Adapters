const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const _ = require('underscore');
const axios = require('axios');

/*==================================================
Settings
==================================================*/
const vaultAddress = "0x86C077092018077Df34FF44D5D7d3f9A2DF03bEf";

const cTokenDecimalScale = BigNumber("10").pow(18);
const cTokensMap = {
  '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // cETH: WETH
  '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643': '0x6B175474E89094C44Da98b954EedeAC495271d0F',  // cDAI: DAI
  '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4' : '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'  // cWBTC: WBTC
}

/*==================================================
  TVL
  ==================================================*/

module.exports = async function tvl(timestamp, block) {

  // Fetch list of token supported by the protocol
  let tokensList = [];
  let response = await axios.get('https://api.dextf.com/dp/assets', {
  });
  for (var i = 0; i < response.data.assets.length; i++) {
    tokensList.push(response.data.assets[i].contract);
  }


  let balances = {};

  // Vault Asset Balances
  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: _.map(tokensList, (token) => {
      return {
        target: token,
        params: vaultAddress
      }
    }),
    abi: 'erc20:balanceOf'
  });

  // cToken Exchange Rates
  let cTokenConversionRatesMap = (await sdk.api.abi.multiCall({
    block,
    calls: _.map(Object.keys(cTokensMap), (cToken) => {
      return {
        target: cToken
      }
    }),
    abi: {
      "constant": true,
      "type": "function",
      "inputs": [],
      "name": "exchangeRateStored",
      "outputs": [
        {
          "name":"",
          "type":"uint256"
        }
      ]
    }
  })).output.reduce(function(map, object) {
    map[object.input.target] = object.output;
    return map;
  }, {});

  // Compute Balances
  _.each(balanceOfResults.output, (balanceOf) => {
      let address = balanceOf.input.target

      if (address in cTokensMap) {
        let addressOfUnderlying = cTokensMap[address];
        let conversionRate = BigNumber(cTokenConversionRatesMap[address]);
        let balanceOfUnderlying = BigNumber(balanceOf.output).times(conversionRate).div(cTokenDecimalScale);

        balances[addressOfUnderlying] = BigNumber(balances[addressOfUnderlying] || 0).plus(balanceOfUnderlying).toFixed();
      } else {
        balances[address] = BigNumber(balances[address] || 0).plus(balanceOf.output).toFixed();
      }
  });

  return balances;
};

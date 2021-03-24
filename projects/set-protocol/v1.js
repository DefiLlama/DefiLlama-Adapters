const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const _ = require('underscore');

/*==================================================
Settings
==================================================*/

const cTokenDecimalScale = BigNumber("10").pow(18);

const tokens = [
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
  '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359', // SAI
  '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC
  '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643', // cDAI
]

const cTokensMap = {
  '0x39AA39c021dfbaE8faC545936693aC917d5E7563': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // cUSDC: USDC
  '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643': '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // cDAI: DAI
}

/*==================================================
  TVL
  ==================================================*/

module.exports = async function tvl(timestamp, block) {
  let balances = {};

  // Vault Asset Balances
  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: _.map(tokens, (token) => {
      return {
        target: token,
        params: '0x5B67871C3a857dE81A1ca0f9F7945e5670D986Dc'
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
      "inputs": [],
      "name": "exchangeRateStored",
      "type": "function",
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
    if(balanceOf.success) {
      let address = balanceOf.input.target

      if (address in cTokensMap) {
        let addressOfUnderlying = cTokensMap[address];
        let conversionRate = BigNumber(cTokenConversionRatesMap[address]);
        let balanceOfUnderlying = BigNumber(balanceOf.output).times(conversionRate).div(cTokenDecimalScale);

        balances[addressOfUnderlying] = BigNumber(balances[addressOfUnderlying] || 0).plus(balanceOfUnderlying).toFixed();
      } else {
        balances[address] = BigNumber(balances[address] || 0).plus(balanceOf.output).toFixed();
      }
    }
  });

  return balances;
};

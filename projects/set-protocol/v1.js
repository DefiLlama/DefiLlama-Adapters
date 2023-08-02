const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');


/*==================================================
Settings
==================================================*/

const cTokenDecimalScale = BigNumber("10").pow(18);

const tokens = [
  ADDRESSES.ethereum.WETH,
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.ethereum.LINK,
  ADDRESSES.ethereum.SAI,
  ADDRESSES.ethereum.DAI,
  ADDRESSES.ethereum.USDC,
  '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC
  '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643', // cDAI
]

const cTokensMap = {
  '0x39AA39c021dfbaE8faC545936693aC917d5E7563': ADDRESSES.ethereum.USDC, // cUSDC: USDC
  '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643': ADDRESSES.ethereum.DAI  // cDAI: DAI
}

/*==================================================
  TVL
  ==================================================*/

module.exports = async function tvl(timestamp, block) {
  let balances = {};

  // Vault Asset Balances
  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: tokens.map((token) => {
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
    calls: Object.keys(cTokensMap).map((cToken) => {
      return {
        target: cToken
      }
    }),
    abi: "uint256:exchangeRateStored"
  })).output.reduce(function(map, object) {
    map[object.input.target] = object.output;
    return map;
  }, {});

  // Compute Balances
  balanceOfResults.output.forEach((balanceOf) => {
      let address = balanceOf.input.target

      if (address in cTokensMap) {
        let addressOfUnderlying = cTokensMap[address];
        let conversionRate = BigNumber(cTokenConversionRatesMap[address]);
        let balanceOfUnderlying = BigNumber(balanceOf.output).times(conversionRate).div(cTokenDecimalScale);

        balances[addressOfUnderlying] = BigNumber(balances[addressOfUnderlying] || 0).plus(balanceOfUnderlying).toFixed(0);
      } else {
        balances[address] = BigNumber(balances[address] || 0).plus(balanceOf.output).toFixed(0);
      }
  });

  return balances;
};

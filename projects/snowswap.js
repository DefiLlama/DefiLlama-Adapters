var Web3 = require('web3');
const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const abis = require('./config/curve/abis.js')

//needs tidying up

async function fetch() {
  let swaps = [
    {
      'name': 'yv',
      'address': '0x4571753311e37ddb44faa8fb78a6df9a6e3c6c0b',
      'coins': [0,1,2,3],
      'type': 'yv',
      'abi': abis.abis.abisBTC
    },
    {
      'name': 'hbtc',
      'address': '0xbf7ccd6c446acfcc5df023043f2167b62e81899b',
      'coins': [0,1],
      'type': 'yv',
      'abi': abis.abis.abisBTC
    }
  ]
  let coinDecimals = [
      {
        '0x37d19d1c4E1fa9DC47bD1eA12f742a0887eDa74a': '18', //Y2TUSD
        '0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e': '6', ///y2USDC
        '0xACd43E627e64355f1861cEC6d3a6688B31a6F952': '18', ///y2DAI
        '0x2f08119C6f07c006695E079AAFc638b8789FAf18': '6', ///y2USDT
        '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c': '18',
        '0x2994529C0652D127b7842094103715ec5299bBed': '18'
      }
  ]
  var tvl = 0;
  var btcTVL = 0;
  await Promise.all(
    swaps.map(async item => {
     var details = {};
     await Promise.all(
       item.coins.map(async i => {
         var dacontract = new web3.eth.Contract(item.abi, item.address)
         var balances = await dacontract.methods.balances(i).call();
         var coins = await dacontract.methods.coins(i).call();

         var poolAmount = await new BigNumber(balances).div(10 ** coinDecimals[0][coins]).toFixed(2);

         if (item.type == 'yv') {
           var multiplier = 1;
           var dacontract = new web3.eth.Contract(abis.abis.yTokens, coins)
           var virtualPrice = await dacontract.methods.getPricePerFullShare().call();
           multiplier = await new BigNumber(virtualPrice).div(10 ** 18).toFixed(4);
           poolAmount = poolAmount * multiplier;
         }
         tvl += parseFloat(poolAmount )

       })
     )
   })
  )
  return tvl;
}

module.exports = {
  fetch
}

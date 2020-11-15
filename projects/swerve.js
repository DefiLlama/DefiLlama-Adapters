var Web3 = require('web3');
const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const abis = require('./config/curve/abis.js')


let swaps = [
  {
    'name': 'swerve',
    'address': '0x329239599afB305DA0A2eC69c58F8a6697F9F88d',
    'coins': [0,1,2,3],
    'type': 1,
    'abi': abis.abis.abisBTC
  }
]

let coinDecimals = [
  {
    '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa': '18',
    '0x0316EB71485b0Ab14103307bf65a021042c6d380': '18',
    '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D': '8',
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': '8',
    '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6': '18',
    '0x196f4727526eA7FB1e17b2071B3d8eAA38486988': '18',
    '0x196f4727526eA7FB1e17b2071B3d8eAA38486988': '18',
    '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5': '18',
    '0x0E2EC54fC0B509F445631Bf4b91AB8168230C752': '18', //linkusd
    '0x674C6Ad92Fd080e4004b2312b45f796a192D27a0': '18', //USDN
    '0x1c48f86ae57291F7686349F12601910BD8D470bb': '18', //USDK
    '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd': '2', //GUSD
    '0x39AA39c021dfbaE8faC545936693aC917d5E7563': '8', //cUSD
    '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643': '8', //cDAI
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': '6', //USDT
    '0x73a052500105205d34Daf004eAb301916DA8190f': '18', //yTUSD
    '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e': '6', ///yUSDC
    '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01': '18', ///yDAI
    '0x83f798e925BcD4017Eb265844FDDAbb448f1707D': '6', ///yUSDT
    '0x8E870D67F660D95d5be530380D0eC0bd388289E1': '18', //PAX
    '0x9777d7E2b60bB01759D0E2f8be2095df444cb07E': '6', ///ycUSDC
    '0x99d1Fa417f94dcD62BfE781a1213c092a47041Bc': '18', ///ycDAI
    '0x1bE5d71F2dA660BFdee8012dDc58D024448A0A59': '6', ///ycUSDT
    '0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE': '18', //Y2busd
    '0x26EA744E5B887E5205727f55dFBE8685e3b21951': '6', ///y2USDC
    '0xC2cB1040220768554cf699b0d863A3cd4324ce32': '18', ///y2DAI
    '0xE6354ed5bC4b393a5Aad09f21c46E101e692d447': '6', ///y2USDT
    '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51': '18', //sUSD
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': '18', //DAI
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': '6', //USDC
    '0x5BC25f649fc4e26069dDF4cF4010F9f706c23831': '18', //dusd
    '0x0000000000085d4780B73119b644AE5ecd22b376': '18'
  }
]




async function fetch() {
  var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,cdai,compound-usd-coin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))


  var tvl = 0;
  var btcTVL = 0;

  await Promise.all(
    swaps.map(async item => {
      var details = {};
      await Promise.all(
        item.coins.map(async i => {
          poolAmount = await calc(item, i, price_feed);
          if (item.type == 'btc') {
            btcTVL += parseFloat(poolAmount);
          } else {
            tvl += parseFloat(poolAmount )
          }
        })
      )
    })
  )



  var total = (price_feed.data.bitcoin.usd * btcTVL) + tvl
  return total;


}

async function getVirtualPrice(abi, contract) {
  var dacontract = new web3.eth.Contract(abi, contract)
  var virtualPrice = await dacontract.methods.getPricePerFullShare().call();
  return virtualPrice;
}



async function calc(item, i, price_feed) {
  var dacontract = new web3.eth.Contract(item.abi, item.address)
  var balances = await dacontract.methods.balances(i).call();
  var coins = await dacontract.methods.coins(i).call();


  var poolAmount = await new BigNumber(balances).div(10 ** coinDecimals[0][coins]).toFixed(2);


  if (item.type == 'compound') {
    var multiplier = 1;
    if (coins === '0x39AA39c021dfbaE8faC545936693aC917d5E7563') {
      multiplier = price_feed.data['compound-usd-coin'].usd;
    }
    if (coins === '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643') {
      multiplier = price_feed.data.cdai.usd;
    }
    poolAmount = poolAmount * multiplier;
  }

  if (item.type == 'yToken') {
    var multiplier = 1;
    if (coins !== '0x8E870D67F660D95d5be530380D0eC0bd388289E1') { // PAX exception
      var multiplier = await getVirtualPrice(abis.abis.yTokens, coins)
      multiplier = await new BigNumber(multiplier).div(10 ** 18).toFixed(4);
    }
    poolAmount = poolAmount * multiplier;
  }


  //console.log(`we have ${item.name}`, `${balances} in ${coins} -- ${poolAmount}`);

  return poolAmount;
}



module.exports = {
  fetch
}

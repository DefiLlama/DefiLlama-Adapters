var Web3 = require('web3');
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const { GraphQLClient, gql } = require('graphql-request')
const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const utils = require('./helper/utils');
const abis = require('./config/uma/abis.js')

/* * * * * * * *
* ==> Ugly code is ugly
*****************/


async function fetch() {
  var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,chainlink,yearn-finance,ethlend,havven,compound-governance-token,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))

  var contracts = [
    "0x75c23271661d9d143dcb617222bc4bec783eff34", //WETH-USDC
    "0x562c0b218cc9ba06d9eb42f3aef54c54cc5a4650", //LINK-USDC
    "0xc226118fcd120634400ce228d61e1538fb21755f", //LEND-USDC
    "0xca7b0632bd0e646b0f823927d3d2e61b00fe4d80", //SNX-USDC
    "0x0d04146b2fe5d267629a7eb341fb4388dcdbd22f", //COMP-USDC
    "0x2109f78b46a789125598f5ad2b7f243751c2934d", //WBTC-USDC
    "0x1b7902a66f133d899130bf44d7d879da89913b2e", //YFI-USDC
  ]
  var balanceCheck = '0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3';
  var tvl = 0;

  var contract = '0x75c23271661d9d143dcb617222bc4bec783eff34';
  var token = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  let balance = await utils.returnBalance(token, contract);
  tvl += (parseFloat(balance) * price_feed.data.ethereum.usd)

  var contract = '0x562c0b218cc9ba06d9eb42f3aef54c54cc5a4650';
  var token = '0x514910771af9ca656af840dff83e8264ecf986ca';
  balance = await utils.returnBalance(token, contract);
  tvl += (parseFloat(balance) * price_feed.data.chainlink.usd)

  var contract = '0xc226118fcd120634400ce228d61e1538fb21755f';
  var token = '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03';
  balance = await utils.returnBalance(token, contract);
  tvl += (parseFloat(balance) * price_feed.data.ethlend.usd)

  var contract = '0xca7b0632bd0e646b0f823927d3d2e61b00fe4d80';
  var token = '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f';
  balance = await utils.returnBalance(token, contract);
  tvl += (parseFloat(balance) * price_feed.data.havven.usd)


  var contract = '0x0d04146b2fe5d267629a7eb341fb4388dcdbd22f';
  var token = '0xc00e94cb662c3520282e6f5717214004a7f26888';
  balance = await utils.returnBalance(token, contract);
  tvl += (parseFloat(balance) * price_feed.data['compound-governance-token'].usd)


  var contract = '0x2109f78b46a789125598f5ad2b7f243751c2934d';
  var token = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
  balance = await utils.returnBalance(token, contract);
  tvl += (parseFloat(balance) * price_feed.data.bitcoin.usd)


  var contract = '0x1b7902a66f133d899130bf44d7d879da89913b2e';
  var token = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e';
  balance = await utils.returnBalance(token, contract);
  tvl += (parseFloat(balance) * price_feed.data['yearn-finance'].usd)

  await Promise.all(
    contracts.map(async contract => {
      var contract = contract;
      var token = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
      let balance = await utils.returnBalance(token, contract);
      tvl += parseFloat(balance)

    })
  )

  return tvl;


}





fetch();



module.exports = {
  fetch
}

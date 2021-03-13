var Web3 = require('web3');
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));

const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const abis = require('./config/abis.js')
const geckoKeys = require('./config/keys.js').keys

const utils = require('./helper/utils');


async function fetch() {
  var pool = '0xb1cff81b9305166ff1efc49a129ad2afcd7bcf19'


  let tokens = [
    '0x92e187a03b6cd19cb6af293ba17f2745fd2357d5',
    '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44',
    '0x2ba592F78dB6436527729929AAf6c908497cB200',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x0Ae055097C6d159879521C384F1D2123D1f195e6',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0xbC396689893D065F41bc2C6EcbeE5e0085233447',
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    '0x4e15361fd6b4bb609fa63c81a2be19d873717870',
    '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    '0xD533a949740bb3306d119CC777fa900bA034cd52',
    '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    '0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713',
    '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',
    '0xb753428af26e81097e7fd17f40c88aaa3e04902c',
    '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
    '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
    '0xc5bddf9843308380375a611c18b50fb9341f502a', //apecrv
    '0x1337def16f9b486faed0293eb623dc8395dfe46a', //armor
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', //wbtc
    '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d', //renbtc
    '0xd291e7a03283640fdc51b121ac401383a46cc623',
    '0x6b175474e89094c44da98b954eedeac495271d0f', //dai
  ];
  let keys = '';
  await Promise.all(
    tokens.map(async (token) => {
      if (geckoKeys[token.toLowerCase()]) {
        if (geckoKeys[token.toLowerCase()] !== 'stable') {
          keys += geckoKeys[token.toLowerCase()]+','
        }
      } else {
        console.log(token.toLowerCase());
      }
    })
  )
  keys = keys.slice(0, -1)
  let price_feed = await utils.getPricesfromString(keys)
  let tvl = 0;
  await Promise.all(
    tokens.map(async (token) => {
      if (geckoKeys[token.toLowerCase()]) {
        let balance = await utils.returnBalance(token, pool);
        let price = 0;
        if (geckoKeys[token.toLowerCase()] == 'stable') {
          price = 1
        } else {
          //console.log(token.toLowerCase(), 'token.toLowerCase()');
          price = price_feed.data[geckoKeys[token.toLowerCase()]].usd
        }
        tvl += price * balance
      }
    })
  )



  return tvl;
  //return totalTvl.data.totalTvl.tvlInUsd;
}

module.exports = {
  fetch
}

/*==================================================
  Modules
  ==================================================*/

  const web3 = require('./config/web3.js');
  const BigNumber = require('bignumber.js');
  const abi = require('./config/wepiggy/abi.json');
  const utils = require('./helper/utils');

  /*==================================================
    TVL
    ==================================================*/

  // ask comptroller for all markets array
  async function getAllMarkets() {
    const contract = new web3.eth.Contract(abi.getAllMarkets, '0x0C8c1ab017c3C0c8A48dD9F1DB2F59022D190f0b')
    return await contract.methods.getAllMarkets().call();
  }

  async function getUnderlying(token) {
    if (token === '0x27A94869341838D5783368a8503FdA5fbCd7987c') {
      return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';//pETH => WETH
    }
    const contract = new web3.eth.Contract(abi.underlying, token)
    return await contract.methods.underlying().call();
  }

  async function getCash(token) {
    let contract = new web3.eth.Contract(abi.getCash, token);
    let cash = await contract.methods.getCash().call();
    let underlying = await getUnderlying(token);
    let decimals = await utils.returnDecimals(underlying)
    let price = (await utils.getTokenPricesFromString(underlying)).data[underlying.toLowerCase()].usd
    cash = await new BigNumber(cash).div(10 ** decimals).times(price);
    return cash;
  }

  async function fetch() {

    let tvl = new BigNumber('0');

    let allMarkets = await getAllMarkets();

    await (
      Promise.all(allMarkets.map(async (token) => {
        let cash = await getCash(token)
        tvl = tvl.plus(cash)
      }))
    );

    return tvl.toFixed(2);
  }

  module.exports = {
    fetch
  }

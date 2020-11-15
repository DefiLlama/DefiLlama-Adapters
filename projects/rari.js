const utils = require('./helper/utils');
var Web3 = require('web3');
const BigNumber = require("bignumber.js");
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const abis = require('./config/rari/abis.js')

async function fetch() {
  var contracts = ['0xD6e194aF3d9674b62D1b30Ec676030C23961275e', '0x59FA438cD0731EBF5F4cDCaf72D4960EFd13FCe6', '0xC6BF8C8A55f77686720E0a88e2Fd1fEEF58ddf4a']

  let price_feed = await utils.getPricesfromString('ethereum');

  var tvl = 0;
  await Promise.all(
    contracts.map(async (contract) => {
      var dacontract = new web3.eth.Contract(abis.abis.rari, contract)
      var balances = await dacontract.methods.getFundBalance().call();
      var rariBalance = new BigNumber(balances).div(10 ** 18).toFixed(2);
      if (contract === '0xD6e194aF3d9674b62D1b30Ec676030C23961275e') {
        tvl += (parseFloat(rariBalance) * price_feed.data.ethereum.usd)
      } else {
        tvl += parseFloat(rariBalance)
      }
    })
  )

  return tvl;
}


module.exports = {
  fetch
}

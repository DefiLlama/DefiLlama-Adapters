const Web3 = require('web3')
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const retry = require('async-retry')
const axios = require("axios");
const abis = require('./config/cover/cover.js')
const utils = require('./helper/utils');

async function fetch() {

    let factory = '0xedfC81Bf63527337cD2193925f9C0cF2D537AccA';
    let dacontract = new web3.eth.Contract(abis.abis.protocols, factory)
    let allProtocols = await dacontract.methods.getAllProtocolAddresses().call();

    let tvl = 0;
    await Promise.all(
      allProtocols.map(async (protocol) => {
        let dacontract = new web3.eth.Contract(abis.abis.cover, protocol)
        let protocolDetails = await dacontract.methods.getProtocolDetails().call();
        await Promise.all(
          protocolDetails._allCovers.map(async cover => {
            let coverBalance = await utils.returnBalance('0x6b175474e89094c44da98b954eedeac495271d0f', cover)
            tvl += coverBalance
          })
        )
      })
    )

    return tvl;

}


module.exports = {
  fetch
}

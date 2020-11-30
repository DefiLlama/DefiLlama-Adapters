var Web3 = require('web3');
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));

const BN = require("bignumber.js");
const abis = require('./config/finnexus/abis.js')
const utils = require('./helper/utils');

async function getTotalCollateral(abi,contract) {
    var dacontract = new web3.eth.Contract(abi, contract)
    var totalCol = await dacontract.methods.getTotalCollateral().call();
    return totalCol;
}

async function fetch() {
    let usdcPool = '0x120f18f5b8edcaa3c083f9464c57c11d81a9e549';
    let fnxPool = '0xfdf252995da6d6c54c03fc993e7aa6b593a57b8d';

    let usdcTotal = await getTotalCollateral(abis.abis.fnxOracle,usdcPool);
    let fnxTotal = await getTotalCollateral(abis.abis.fnxOracle,fnxPool);

    usdcTotal = new BN(usdcTotal).div(new BN(10 ** 24)).toFixed(2);
    fnxTotal = new BN(fnxTotal).div(new BN(10 ** 24)).toFixed(2);

    let tlv = parseFloat(usdcTotal) + parseFloat(fnxTotal);

    return tlv;
}


module.exports = {
  fetch
}

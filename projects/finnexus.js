var Web3 = require('web3');
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const web3wan = new Web3(new Web3.providers.HttpProvider('https://gwan-ssl.wandevs.org:56891'));
const BN = require("bignumber.js");
const abis = require('./config/finnexus/abis.js')

async function getEthTotalCollateral(abi,contract) {
    var dacontract = new web3.eth.Contract(abi, contract)
    var totalCol = await dacontract.methods.getTotalCollateral().call();
    return totalCol;
}

async function getWanTotalCollateral(abi,contract) {
    var dacontract = new web3wan.eth.Contract(abi, contract)
    var totalCol = await dacontract.methods.getTotalCollateral().call();
    return totalCol;
}

async function fetch() {
    let ethUsdcPool = '0x120f18f5b8edcaa3c083f9464c57c11d81a9e549';
    let ethFnxPool = '0xfdf252995da6d6c54c03fc993e7aa6b593a57b8d';
    let wanFnxPool = '0xae85f191698483d36ff9fb29b36fb12f67a0c253';

    let ethUsdcTotal = await getEthTotalCollateral(abis.abis.fnxOracle,ethUsdcPool);
    let ethFnxTotal = await getEthTotalCollateral(abis.abis.fnxOracle,ethFnxPool);
    let wanFnxTotal = await getWanTotalCollateral(abis.abis.fnxOracle,wanFnxPool);

    ethUsdcTotal = new BN(ethUsdcTotal).div(new BN(10 ** 24)).toFixed(2);
    ethFnxTotal = new BN(ethFnxTotal).div(new BN(10 ** 24)).toFixed(2);
    wanFnxTotal = new BN(wanFnxTotal).div(new BN(10 ** 24)).toFixed(2);

    let tlv = parseFloat(ethUsdcTotal) + parseFloat(ethFnxTotal) + parseFloat(wanFnxTotal);

    return tlv;
}

module.exports = {
  fetch
}

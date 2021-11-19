const Web3 = require('web3');
require("dotenv").config();
const defaultWeb3Url = "https://bsc-dataseed.binance.org, https://bsc-dataseed1.defibit.io/, https://bsc-dataseed1.ninicoin.io/";
let web3RpcUrl = (process.env.BSC_RPC || defaultWeb3Url).split(',')[0];
const web3 = new Web3(new Web3.providers.HttpProvider(web3RpcUrl));
module.exports = web3;
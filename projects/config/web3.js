const Web3 = require('web3');
require("dotenv").config();
let web3RpcUrl = process.env.ETHEREUM_RPC.split(',')[0];
const web3 = new Web3(new Web3.providers.HttpProvider(web3RpcUrl));
module.exports = web3;
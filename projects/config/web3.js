const Web3 = require('web3');
const env = require("dotenv").config();
let web3RpcUrl = process.env.ETHEREUM_RPC;
const web3 = new Web3(new Web3.providers.HttpProvider(web3RpcUrl));
module.exports = web3;
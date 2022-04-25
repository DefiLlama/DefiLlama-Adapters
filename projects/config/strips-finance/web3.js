const Web3 = require('web3');
require("dotenv").config();
const defaultWeb3Url = "https://arb1.arbitrum.io/rpc"
let web3RpcUrl = (process.env.ARBITRUM_RPC || defaultWeb3Url).split(',')[0];
const web3 = new Web3(new Web3.providers.HttpProvider(web3RpcUrl));
module.exports = web3;
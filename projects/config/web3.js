const Web3 = require('web3');
require("dotenv").config();
const defaultWeb3Url = "https://cloudflare-eth.com/,https://eth-mainnet.gateway.pokt.network/v1/5f3453978e354ab992c4da79,https://main-light.eth.linkpool.io/,https://api.mycryptoapi.com/eth"
let web3RpcUrl = (process.env.ETHEREUM_RPC || defaultWeb3Url).split(',')[0];
const web3 = new Web3(new Web3.providers.HttpProvider(web3RpcUrl));
module.exports = web3;
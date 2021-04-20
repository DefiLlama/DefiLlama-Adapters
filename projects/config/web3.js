const Web3 = require('web3');
const env = require("dotenv").config();
let web3RpcUrl;
if(process.env && process.env.ALCHEMY_API){
    web3RpcUrl = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API}`
} else if(env && env.parsed && env.parsed.INFURA_KEY){
    web3RpcUrl = `https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`
}
const web3 = new Web3(new Web3.providers.HttpProvider(web3RpcUrl));
module.exports = web3;
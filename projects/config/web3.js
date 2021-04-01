const Web3 = require('web3');
const env = require("dotenv").config();
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
module.exports = web3;
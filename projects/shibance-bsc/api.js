const Web3 = require("web3");

require("dotenv").config();

function getWeb3(chain) {
  let envName = chain.toUpperCase() + "_RPC";
  let web3RpcUrl = process.env[envName].split(",")[0];
  return new Web3(new Web3.providers.HttpProvider(web3RpcUrl));
}


module.exports = {
  getWeb3
};

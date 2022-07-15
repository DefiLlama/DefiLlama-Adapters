
/**
 * Module dependencies.
 */
const Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider(`https://evm.kava.io`))

async function fetch() {
  let balance = web3.utils.fromWei(await web3.eth.getBalance('0xc13791DA84f43525189456CfE2026C60D3B7F706')); // WETH contract
  // console.log('balance ' + balance);
  return balance;
}

module.exports = {
  fetch
}

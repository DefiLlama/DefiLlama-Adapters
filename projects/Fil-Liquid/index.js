const abi = require('./abi.json');
const { Web3 } = require('web3');
const web3 = new Web3(`https://api.node.glif.io`);
const ADDRESSES = require('../helper/coreAssets.json')
const contract = "0x857b27968f522afA5038F01b1e1f9EdfA3cc631d";

async function getTVL(api) {
  var instance = new web3.eth.Contract(abi, contract)
  var data = await instance.methods.getTVL().call();
  console.log("minerNum %d, collaterizedMinerNum %d, totalLockedMinerBalance %d, totalFILLiquidity %d, availableFILLiquidity %d", data[0], data[1], data[2], data[3], data[4]);
  
  api.add(ADDRESSES.null, data[5]);
}

module.exports = {
  filecoin: {
    tvl: getTVL,
  },
};

const { Web3 } = require('web3');
const web3 = new Web3('https://api.node.glif.io'); // 注意将 URL 包裹在引号中
const abi = require('./abi.json');
const ADDRESSES = require('../helper/coreAssets.json');
const contract = "0x857b27968f522afA5038F01b1e1f9EdfA3cc631d";

async function getTVL(api) {
  try {
    const instance = new web3.eth.Contract(abi, contract);
    const data = await instance.methods.getTVL().call();

    console.log("minerNum %d, collaterizedMinerNum %d, totalLockedMinerBalance %d, totalFILLiquidity %d, availableFILLiquidity %d, TVL %d", 
      data[0], data[1], data[2], data[3], data[4], data[5]);
    
    api.add(ADDRESSES.null, data[5]); // 传递 TVL 数据给 defilama 的 API
  } catch (error) {
    console.error("Error fetching TVL:", error);
  }
}

module.exports = {
  filecoin: {
    tvl: getTVL,
  },
};
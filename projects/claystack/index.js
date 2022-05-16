const sdk = require('@defillama/sdk');
const clayMainAbi = require('./clayABIs/clayMain.json');
const web3 = require('../config/web3.js');

const clayAddresses = {
  clayMatic: "0x91730940DCE63a7C0501cEDfc31D9C28bcF5F905",
};

const coinAddresses = {
  matic: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", 
};

async function getClayMaticTvl(block) {
  const clayMaticInstance = new web3.eth.Contract(clayMainAbi, clayAddresses.clayMatic);
  const deposits = await clayMaticInstance.methods.funds().call();
  return { [coinAddresses.matic]: deposits.currentDeposit };
}

module.exports = {

  ethereum: {
    tvl: getClayMaticTvl,
  },
  methodology: `We get the total token deposited in clay contracts and convert it to USD.`
}
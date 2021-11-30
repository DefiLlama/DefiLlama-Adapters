// const Web3 = require('web3');
// const BigNumber = require('bignumber.js');

const utils = require("../helper/utils");
// const { getContractInstance } = require('../config/eurxb/utils.js');
const masterchefABI = require("./abis/masterchef.json");
const dop_Ether = "0x00aa1c57e894c4010fe44cb840ae56432d7ea1d1";
const NDR = "0x739763a258640919981F9bA610AE65492455bE53";
const masterchef = "0x8A78011bf2c42df82cC05F198109Ea024B554df9";

// const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.ETHEREUM_RPC}`))

const staking = async () => {
  // const masterchefContract = await getContractInstance(masterchefABI, masterchef);
  // const poolLength = await masterchefContract.methods.poolLength().call();
  // console.log('poolLength', poolLength)
  return 0;
};

const fetch = async () => {
  var res = await utils.fetchURL("https://drops.co/status");
  // const stakingTVL = await staking()
  return res.data ? res.data.totalSupply : 0;
};

module.exports = {
  methodology:
    "TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.",
  fetch,
};

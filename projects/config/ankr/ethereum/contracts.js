const ERC20Abi = require('../../../helper/ankr/abis/ERC20.json');
const web3 = require('../../web3.js');
const tokenAddresses = require('./tokenAddresses');

const aETHcTokenContract = new web3.eth.Contract(ERC20Abi, tokenAddresses.aETHc);
const aMATICbTokenContract = new web3.eth.Contract(ERC20Abi, tokenAddresses.aMATICb);
const aDOTbTokenContract = new web3.eth.Contract(ERC20Abi, tokenAddresses.aDOTb);
const aKSMbTokenContract = new web3.eth.Contract(ERC20Abi, tokenAddresses.aKSMb);

module.exports = {
  aETHcTokenContract,
  aMATICbTokenContract,
  aDOTbTokenContract,
  aKSMbTokenContract,
}
const { createWeb3 } = require('../../../helper/ankr/utils');
const { fantomRpcUrl } = require('../../../helper/ankr/networks');
const ERC20Abi = require('../../../helper/ankr/abis/ERC20.json');
const web3 = createWeb3(fantomRpcUrl);
const tokenAddresses = require('./tokenAddresses');

const aFTMbTokenContract = new web3.eth.Contract(ERC20Abi, tokenAddresses.aFTMb);

module.exports = {
  aFTMbTokenContract,
}
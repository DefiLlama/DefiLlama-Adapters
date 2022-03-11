const { createWeb3 } = require('../../../helper/ankr/utils');
const { binanceRpcUrl } = require('../../../helper/ankr/networks');
const ERC20Abi = require('../../../helper/ankr/abis/ERC20.json');
const web3 = createWeb3(binanceRpcUrl);
const tokenAddresses = require('./tokenAddresses');

const aBNBbTokenContract = new web3.eth.Contract(ERC20Abi, tokenAddresses.aBNBb);

module.exports = {
  aBNBbTokenContract,
}
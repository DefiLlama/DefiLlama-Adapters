const { createWeb3 } = require('../../../helper/ankr/utils');
const { avalancheRpcUrl } = require('../../../helper/ankr/networks');
const ERC20Abi = require('../../../helper/ankr/abis/ERC20.json');
const web3 = createWeb3(avalancheRpcUrl);
const tokenAddresses = require('./tokenAddresses');

const aAVAXbTokenContract = new web3.eth.Contract(ERC20Abi, tokenAddresses.aAVAXb);

module.exports = {
  aAVAXbTokenContract,
}
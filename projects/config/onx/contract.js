const tokenAddresses = require('./constant');
const web3 = require('../web3.js');

const onxContractAbi = require('../../helper/ankr/abis/OnxToken.json');
const UniswapV2PairContractAbi = require('../../helper/ankr/abis/UniswapV2Pair.json');
const onxPoolContractAbi = require('../../helper/ankr/abis/OnxPool.json');
const aethTokenContractAbi = require('../../helper/ankr/abis/AethToken.json');
const onsTokenContractAbi = require('../../helper/ankr/abis/OnsToken.json');
const ERC20Abi = require('../../helper/ankr/abis/ERC20.json');

const onxTokenContract = new web3.eth.Contract(onxContractAbi, tokenAddresses.onx);
const usdtWethPairContract = new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.usdWethPair);
const wethAethPairContract = new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.wethAethPair);
const onxWethSushiPairContract = new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.onxWethSushiPair);
const ankrWethPairContract = new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.ankrWethPair);
const onxPoolContract = new web3.eth.Contract(onxPoolContractAbi, tokenAddresses.pool);
const aethPairOnsContract = new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.aethPairOns);
const aethPairOneContract = new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.aethPairOne);
const aethPairEthContract = new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.aethPairEth);
const aethTokenContract = new web3.eth.Contract(aethTokenContractAbi, tokenAddresses.aethToken);
const onsTokenContract = new web3.eth.Contract(onsTokenContractAbi, tokenAddresses.onsToken);
const bondPairEthContract = new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.bondPairEth);
const sushiPairEthContract = new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.sushiPairEth);
const wethTokenContract = new web3.eth.Contract(ERC20Abi, tokenAddresses.wethToken);
const daiTokenContract = new web3.eth.Contract(ERC20Abi, tokenAddresses.daiToken);
const fraxTokenContract = new web3.eth.Contract(ERC20Abi, tokenAddresses.fraxToken);
const usdcTokenContract = new web3.eth.Contract(ERC20Abi, tokenAddresses.usdcToken);

const onsPoolsContracts = {
  aethPairOne: new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.aethPairOne),
  aethPairOns: new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.aethPairOns),
  aethPairEth: new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.aethPairEth),
}

module.exports = {
  onxTokenContract,
  usdtWethPairContract,
  wethAethPairContract,
  onxWethSushiPairContract,
  ankrWethPairContract,
  onxPoolContract,
  aethPairOnsContract,
  aethPairOneContract,
  aethPairEthContract,
  aethTokenContract,
  onsTokenContract,
  bondPairEthContract,
  sushiPairEthContract,
  onsPoolsContracts,
  wethTokenContract,
  daiTokenContract,
  fraxTokenContract,
  usdcTokenContract,
}
const Web3 = require('web3');
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const tokenAddresses = require('./constant');

const onxContractAbi = require('./abis/OnxToken.json');
const UniswapV2PairContractAbi = require('./abis/UniswapV2Pair.json');
const onxPoolContractAbi = require('./abis/OnxPool.json');
const aethTokenContractAbi = require('./abis/AethToken.json');
const onsTokenContractAbi = require('./abis/OnsToken.json');
const ERC20Abi = require('./abis/ERC20.json');

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

const farmContracts = {
  onxEthLp: new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.farms[0].address),
  onxEthSlp: new web3.eth.Contract(UniswapV2PairContractAbi, tokenAddresses.farms[1].address),
  aEth: new web3.eth.Contract(ERC20Abi, tokenAddresses.farms[2].address),
  ankr: new web3.eth.Contract(ERC20Abi, tokenAddresses.farms[3].address),
  xSushi: new web3.eth.Contract(ERC20Abi, tokenAddresses.farms[4].address)
}

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
  farmContracts,
  onsPoolsContracts,
  wethTokenContract,
  daiTokenContract,
  fraxTokenContract,
  usdcTokenContract
}
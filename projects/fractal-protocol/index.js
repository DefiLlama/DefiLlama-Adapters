const sdk = require('@defillama/sdk')
const Web3 = require('web3');
const axios = require("axios");

const vaultAbi = [
  {
    inputs: [],
    name: 'getTokenPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
const usdfAbi = [
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const USDF_TOKEN_CONTRACT = '0x51acB1ea45c1EC2512ae4202B9076C13016dc8aA';
const FRACTAL_VAULT_CONTRACT = '0x3EAa4b3e8967c02cE1304C1EB35e8C5409838DFC';

const web3 = new Web3(process.env.INFURA_CONNECTION);

const usdfEthereumMetrics = async () => {
  //set contracts
  const usdfContract = new web3.eth.Contract(usdfAbi, USDF_TOKEN_CONTRACT);
  const vaultContract = new web3.eth.Contract(vaultAbi, FRACTAL_VAULT_CONTRACT);

  const usdfTotalSupply = await usdfContract.methods.totalSupply().call();
  const usdfPrice = await vaultContract.methods.getTokenPrice().call();

  const usdfTvl = (usdfTotalSupply * usdfPrice) / 1e12;
  return usdfTvl

}

const whitelabelMoonriverMetrics = async () => {
  const data = await axios.get('https://api.fractalprotocol.org/api/vault/total-tvl')
  const whitelabelTvlMoonriver = data.data.whitelabelTvlMoonriver
  return whitelabelTvlMoonriver
}


module.exports = {
  ethereum: {
    methodology: "Total Value Locked in Fractal via USDF.",
    tvl: usdfEthereumMetrics
  },
  moonriver: {
    methodology: "Total Value Locked in Fractal White Label Strategies on Moonriver.",
    tvl: whitelabelMoonriverMetrics
  } 
}



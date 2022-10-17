const sdk = require('@defillama/sdk')
const Web3 = require('web3');
const axios = require("axios");

const vaultAbi = 
  {
    inputs: [],
    name: 'getTokenPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  }
;
const usdfAbi = 
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  }
;

const USDF_TOKEN_CONTRACT = '0x51acB1ea45c1EC2512ae4202B9076C13016dc8aA';
const FRACTAL_VAULT_CONTRACT = '0x3EAa4b3e8967c02cE1304C1EB35e8C5409838DFC';

async function usdfEthereumTvl(timestamp, block) {
  //set contracts

  const {output: usdfTotalSupply} = await sdk.api.abi.call({ target: USDF_TOKEN_CONTRACT, block, abi: usdfAbi})
  const {output: usdfPrice} = await sdk.api.abi.call({ target: FRACTAL_VAULT_CONTRACT, block, abi: vaultAbi})

  const usdfTvl = (usdfTotalSupply * usdfPrice) / 1e12;
  return {
    'usd-coin': usdfTvl 
  }

}

 async function whitelabelMoonriverTvl(timestamp, block) {
  const data = await axios.get('https://api.fractalprotocol.org/api/vault/total-tvl')
  const whitelabelTvlMoonriver = data.data.whitelabelTvlMoonriver
  return {
    'usd-coin': whitelabelTvlMoonriver 
  } 
}


module.exports = {
  ethereum: {
    methodology: "Total Value Locked in Fractal via USDF.",
    tvl: usdfEthereumTvl
  },
  moonriver: {
    methodology: "Total Value Locked in Fractal White Label Strategies on Moonriver.",
    tvl: whitelabelMoonriverTvl
  } 
}



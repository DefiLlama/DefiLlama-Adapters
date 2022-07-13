const axios = require('axios');
const abis = require('./abis.json')
const sdk = require('@defillama/sdk')
const sol = require('./sol-helpers');
const { getBlock } = require('../helper/getBlock');
const { getConnection } = require('../helper/solana');

const ethContract = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';

async function terra(timestamp, ethBlock, chainBlocks) {
  /*
  const { block } = await sdk.api.util.lookupBlock(timestamp, {
    chain: 'terra'
  })
  const { total_bond_amount } = (
    await axios.get(`https://lcd.terra.dev/wasm/contracts/terra1mtwph2juhj0rvjz7dy92gvl6xvukaxu8rfv8ts/store?query_msg=%7B%22state%22%3A%20%7B%7D%7D&height=${block - (block % 100)}`) // Node is semi-pruned, only every 100th block is stored
  ).data.result;
  */
  const { total_bond_amount } = (
    await axios.get(`https://lcd.terra.dev/wasm/contracts/terra1mtwph2juhj0rvjz7dy92gvl6xvukaxu8rfv8ts/store?query_msg=%7B%22state%22%3A%20%7B%7D%7D`)
  ).data.result;
  return {
    'terra-luna': total_bond_amount / 1000000
  }
}

async function eth(timestamp, ethBlock, chainBlocks) {
  const pooledETH = await sdk.api.abi.call({
    block: ethBlock,
    target: ethContract,
    abi: abis.find(abi => abi.name === "getTotalPooledEther")
  })

  const pooledMatic = await sdk.api.abi.call({
    block: ethBlock,
    target: "0x9ee91F9f426fA633d227f7a9b000E28b9dfd8599",
    abi: {"inputs":[],"name":"getTotalPooledMatic","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
  })

  return {
    '0x0000000000000000000000000000000000000000': pooledETH.output,
    "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0": pooledMatic.output,
  }
}

async function ksm(timestamp, ethBlock, chainBlocks) {
  const chain = "moonriver"
  const block = await getBlock(timestamp, chain, chainBlocks, true)
  const pooledCoin = await sdk.api.abi.call({
    block,
    chain,
    target: "0xffc7780c34b450d917d557e728f033033cb4fa8c",
    abi: {"inputs":[],"name":"getTotalPooledKSM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
  })

  return {
    'kusama': Number(pooledCoin.output)/1e12,
  }
}

async function solana(timestamp, ethBlock, chainBlocks) {
  const connection = getConnection()
  const validatorsBalance = await sol.retrieveValidatorsBalance(connection)
  const reserveAccountBalance = await sol.retrieveReserveAccountBalance(connection)

  const totalSolInLamports = validatorsBalance + reserveAccountBalance;
  return {
    'solana': totalSolInLamports/1e9
  }
}

module.exports = {
  hallmarks: [
    [1651881600,"UST depeg"]
  ],
  methodology: 'Staked tokens are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued, stMATIC is counted as Ethereum TVL since MATIC is staked in Ethereum and the liquidity token is also issued on Ethereum',
  timetravel: false, // solana
  doublecounted: true,
  solana: {
    tvl: solana
  },
  ethereum: {
    tvl: eth
  },
  terra: {
    tvl: terra
  },
  moonriver:{
    tvl: ksm
  },
}

const axios = require('axios');
const abis = require('./abis.json')
const sdk = require('@defillama/sdk')

const ethContract = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';

async function terra(timestamp, ethBlock, chainBlocks) {
  const { block } = await sdk.api.util.lookupBlock(timestamp, {
    chain: 'terra'
  })
  const { total_bond_amount } = (
    await axios.get(`https://lcd.terra.dev/wasm/contracts/terra1mtwph2juhj0rvjz7dy92gvl6xvukaxu8rfv8ts/store?query_msg=%7B%22state%22%3A%20%7B%7D%7D&height=${block - (block % 100)}`) // Node is semi-pruned, only every 100th block is stored
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

  return {
    '0x0000000000000000000000000000000000000000': pooledETH.output
  }
}

async function solana(timestamp, ethBlock, chainBlocks) {
  const stats = await axios.get('https://solana.lido.fi/api/stats')
  return {
    'solana': stats.data.totalStaked.sol
  }
}

module.exports = {
  ethereum: {
    tvl: eth
  },
  terra: {
    tvl: terra
  },
  /*
  solana:{
    tvl: solana
  },
  */
  tvl: sdk.util.sumChainTvls([eth, terra])
}
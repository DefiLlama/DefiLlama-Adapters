const ADDRESSES = require('../helper/coreAssets.json')
const axios = require('axios');
const sdk = require('@defillama/sdk')
const sol = require('./sol-helpers');
const { getConnection } = require('../helper/solana');

const ethContract = ADDRESSES.ethereum.STETH;

async function terra(timestamp, ethBlock, chainBlocks) {
  return {}
  // const { total_bond_amount } = (
  //   await axios.get(`https://lcd.terra.dev/wasm/contracts/terra1mtwph2juhj0rvjz7dy92gvl6xvukaxu8rfv8ts/store?query_msg=%7B%22state%22%3A%20%7B%7D%7D`)
  // ).data.result;
  // return {
  //   'terra-luna': total_bond_amount / 1000000
  // }
}

async function eth(timestamp, ethBlock, chainBlocks) {
  const pooledETH = await sdk.api.abi.call({
    block: ethBlock,
    target: ethContract,
    abi: "uint256:getTotalPooledEther"
  })

  const pooledMatic = await sdk.api.abi.call({
    block: ethBlock,
    target: "0x9ee91F9f426fA633d227f7a9b000E28b9dfd8599",
    abi: "uint256:getTotalPooledMatic",
  })

  return {
    [ADDRESSES.null]: pooledETH.output,
    [ADDRESSES.ethereum.MATIC]: pooledMatic.output,
  }
}

async function ksm(timestamp, ethBlock, {moonriver: block}) {
  const chain = "moonriver"
  const pooledCoin = await sdk.api.abi.call({
    block,
    chain,
    target: "0xffc7780c34b450d917d557e728f033033cb4fa8c",
    abi: "uint256:getTotalPooledKSM",
  })

  return {
    'kusama': Number(pooledCoin.output)/1e12,
  }
}

async function dot(timestamp, ethBlock, {moonbeam: block}) {
  const chain = "moonbeam"
  const pooledCoin = await sdk.api.abi.call({
    block,
    chain,
    target: ADDRESSES.moonbeam.stDOT,
    abi: "uint256:getTotalPooledKSM",
  })

  return {
    'polkadot': Number(pooledCoin.output)/1e10,
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
    [1610496000, "Start of incentives for curve pool"],
    [1651881600,"UST depeg"],
    [1667865600, "FTX collapse"],
    [1684108800, "ETH Withdrawal Activation"]
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
  moonbeam:{
    tvl: dot
  },
}

const axios = require('axios');
const abis = require('./abis.json')
const sdk = require('@defillama/sdk')
const { Connection, PublicKey } = require('@solana/web3.js');
const { deserializeUnchecked } = require('borsh');
const {Lido, schema} = require('./Lido')

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
  const connection = new Connection('https://solana-api.projectserum.com/');
  const validatorsBalance = await retrieveValidatorsBalance(connection)
  const reserveAccountBalance = await retrieveReserveAccountBalance(connection)

  const totalSolInLamports = validatorsBalance + reserveAccountBalance;
  return {
    'solana': totalSolInLamports/1e9
  }
}

async function retrieveValidatorsBalance(connection) {
  const accountInfo = await connection.getAccountInfo(new PublicKey("49Yi1TKkNyYjPAFdR9LBvoHcUjuPX4Df5T5yv39w2XTn"));
  const deserializedAccountInfo = deserializeUnchecked(
    schema,
    Lido,
    accountInfo.data,
  );
  return deserializedAccountInfo.validators.entries
    .map(pubKeyAndEntry => pubKeyAndEntry.entry)
    .map(validator => validator.stake_accounts_balance.toNumber())
    .reduce((prev, current) => prev + current, 0)
}

async function retrieveReserveAccountBalance(connection) {
  const accountInfo = await connection.getAccountInfo(new PublicKey("3Kwv3pEAuoe4WevPB4rgMBTZndGDb53XT7qwQKnvHPfX"));
  const rent = await connection.getMinimumBalanceForRentExemption(accountInfo.data.byteLength);
  return accountInfo.lamports - rent;
}

module.exports = {
  cantRefill: true,
  solana: {
    tvl: solana
  },
  ethereum: {
    tvl: eth
  },
  terra: {
    tvl: terra
  },
  tvl: sdk.util.sumChainTvls([eth, terra, solana])
}
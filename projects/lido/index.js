const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js');
const { decodeAccount } = require('../helper/solana')

const SOLIDO_ADDRESS = "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1";
const RESERVE_ACCOUNT_ADDRESS = "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE";

async function retrieveValidatorsBalance(connection) {
  const accountInfo = await connection.getAccountInfo(new PublicKey(SOLIDO_ADDRESS));
  const deserializedAccountInfo = decodeAccount('lido', accountInfo)
  const validatorListAddress = new PublicKey(deserializedAccountInfo.validator_list)
  const validatorsInfo = await connection.getAccountInfo(validatorListAddress);
  const decodedValInfo = decodeAccount('lidoValidatorList', validatorsInfo)
  return decodedValInfo.entries
    .map(validator => validator.effective_stake_balance.toNumber())
    .reduce((prev, current) => prev + current, 0)
}

async function retrieveReserveAccountBalance(connection) {
  const accountInfo = await connection.getAccountInfo(new PublicKey(RESERVE_ACCOUNT_ADDRESS));
  const rent = await connection.getMinimumBalanceForRentExemption(accountInfo.data.byteLength);
  return accountInfo.lamports - rent;
}
const sol = {
  retrieveValidatorsBalance,
  retrieveReserveAccountBalance
};
const { getConnection } = require('../helper/solana');

const ethContract = ADDRESSES.ethereum.STETH;

async function terra() {
  return {}
}

async function eth(api) {
  const pooledETH = await api.call({
    target: ethContract,
    abi: "uint256:getTotalPooledEther"
  })

  const pooledMatic = await api.call({
    target: "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1",
    abi: "uint256:getTotalPooledMatic",
  })

  return {
    [ADDRESSES.null]: pooledETH,
    [ADDRESSES.ethereum.MATIC]: pooledMatic,
  }
}

async function ksm(api)  {
  const chain = "moonriver"
  const pooledCoin = await api.call({
    chain,
    target: "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE",
    abi: "uint256:getTotalPooledKSM",
  })

  return {
    'kusama': Number(pooledCoin)/1e12,
  }
}

async function dot(api)  {
  const chain = "moonbeam"
  const pooledCoin = await api.call({
    chain,
    target: ADDRESSES.moonbeam.stDOT,
    abi: "uint256:getTotalPooledKSM",
  })

  return {
    'polkadot': Number(pooledCoin)/1e10,
  }
}

async function solana() {
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
    ['2021-01-13', "Start of incentives for curve pool"],
    ['2022-05-07',"UST depeg"],
    ['2022-06-10', "stETH depeg"],
    ['2022-11-08', "FTX collapse"],
    ['2023-05-15', "ETH Withdrawal Activation"]
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

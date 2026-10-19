const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js');
const { decodeAccount } = require('../helper/solana')

const SOLIDO_ADDRESS = "49Yi1TKkNyYjPAFdR9LBvoHcUjuPX4Df5T5yv39w2XTn";
const RESERVE_ACCOUNT_ADDRESS = "3Kwv3pEAuoe4WevPB4rgMBTZndGDb53XT7qwQKnvHPfX";

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

const VAULT_HUB = "0x1d201BE093d847f6446530Efb0E8Fb426d176709";
const VAULT_HUB_START_BLOCK = 23933041;

// Lido V3: ETH held in stVaults is outside getTotalPooledEther() except for the part
// minted as stETH against vault collateral, which shows up as getExternalEther().
// So the uncounted remainder is sum(totalValue) - getExternalEther().
async function stVaultEther(api) {
  if (api.block < VAULT_HUB_START_BLOCK) return 0n

  const vaults = await api.fetchList({
    lengthAbi: "uint256:vaultsCount",
    itemAbi: "function vaultByIndex(uint256) view returns (address)",
    target: VAULT_HUB,
    startFromOne: true,
  })
  if (!vaults.length) return 0n
  
  const totalValues = await api.multiCall({
    target: VAULT_HUB,
    abi: "function totalValue(address) view returns (uint256)",
    calls: vaults.map(vault => ({ params: [vault] })),
  })
  const externalEther = await api.call({ target: ethContract, abi: "uint256:getExternalEther" })

  // subtracting externalEther is required, it is already inside getTotalPooledEther()
  const uncounted = totalValues.reduce((sum, value) => sum + BigInt(value), 0n) - BigInt(externalEther)
  return uncounted > 0n ? uncounted : 0n
}

async function eth(api) {
  const pooledETH = await api.call({
    target: ethContract,
    abi: "uint256:getTotalPooledEther"
  })

  const pooledMatic = await api.call({
    target: "0x9ee91F9f426fA633d227f7a9b000E28b9dfd8599",
    abi: "uint256:getTotalPooledMatic",
  })

  const vaultETH = await stVaultEther(api)

  return {
    [ADDRESSES.null]: (BigInt(pooledETH) + vaultETH).toString(),
    [ADDRESSES.ethereum.MATIC]: pooledMatic,
  }
}

async function ksm(api)  {
  const chain = "moonriver"
  const pooledCoin = await api.call({
    chain,
    target: "0xffc7780c34b450d917d557e728f033033cb4fa8c",
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
  methodology: 'Staked tokens are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued, stMATIC is counted as Ethereum TVL since MATIC is staked in Ethereum and the liquidity token is also issued on Ethereum.',
  timetravel: false, // solana
  doublecounted: true,
  solana: {
    tvl: solana
  },
  ethereum: {
    tvl: eth
  },
  terra: {
    tvl: () => ({}),
  },
  moonriver:{
    tvl: ksm
  },
  moonbeam:{
    tvl: dot
  },
}

const ADDRESSES = require('../helper/coreAssets.json')
const { function_view } = require('../helper/chain/aptos')
const { call: near_call } = require('../helper/chain/near')
const { queryContract } = require('../helper/chain/cosmos')
const { getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const TRUSTAKE_APT_CONTRACT_ADDR = "0x6f8ca77dd0a4c65362f475adb1c26ae921b1d75aa6b70e53d0e340efd7d8bc80"
const MODULE = "staker"
const FUNCTION = "total_staked"

async function aptosTvl(api) {
  const totalStaked = await function_view({ functionStr: `${TRUSTAKE_APT_CONTRACT_ADDR}::${MODULE}::${FUNCTION}` })
  api.add(ADDRESSES.aptos.APT, totalStaked)
}

const abi = {
  "totalShares": "uint256:totalShares",
  "sharePrice": "function sharePrice() external view returns (uint256, uint256)",
  "getDust": "uint256:getDust"
}

const TRUSTAKE_CONTRACT_ADDR = "0xa43a7c62d56df036c187e1966c03e2799d8987ed"
const MATIC_TOKEN_ADDR = ADDRESSES.ethereum.MATIC

async function tvl(api) {
  const totalSupply = (await api.call({ abi: 'erc20:totalSupply', target: TRUSTAKE_CONTRACT_ADDR, }))
  const sharePriceArray = (await api.call({ abi: abi.sharePrice, target: TRUSTAKE_CONTRACT_ADDR, }))
  const dust = (await api.call({ abi: abi.getDust, target: TRUSTAKE_CONTRACT_ADDR, }))
  const sharePrice = sharePriceArray[0] / sharePriceArray[1] / 1e18
  api.add(MATIC_TOKEN_ADDR, (totalSupply * sharePrice) + +dust)
}

const TRUSTAKE_NEAR_CONTRACT_ADDR = "staker1.msig1.trufin.near"

async function nearTvl() {
  const totalStaked = await near_call(TRUSTAKE_NEAR_CONTRACT_ADDR, 'get_total_staked', {})
  return { near: totalStaked[0] / 1e24 }
}

const TRUSTAKE_INJ_CONTRACT_ADDR = "inj1x997dy6ka7y8u0r56yk2k83llspy33yet9zcnq"

async function injectiveTvl(api) {
  const { total_staked } = await queryContract({ contract: TRUSTAKE_INJ_CONTRACT_ADDR, chain: "injective", data: '{"get_total_staked": {}}'})
  api.add(ADDRESSES.injective.INJ, total_staked)
}

const TRUSTAKE_SOL_STAKE_POOL_ACCOUNT_ID = "EyKyx9LKz7Qbp6PSbBRoMdt8iNYp8PvFVupQTQRMY9AM"

async function solanaTvl() {
  const connection = getConnection();
  const account = await connection.getAccountInfo(new PublicKey(TRUSTAKE_SOL_STAKE_POOL_ACCOUNT_ID))
  return {
    solana: Number(account.data.readBigUint64LE(258))/1e9
  }
}

module.exports = {
  methodology: `Counts the TVL of native tokens across all TruStake vaults.`,
  ethereum: {
    tvl
  },
  aptos: {
    tvl: aptosTvl
  },
  near: {
    tvl: nearTvl
  },
  injective: {
    tvl: injectiveTvl
  },
  solana: {
    tvl: solanaTvl
  }
}

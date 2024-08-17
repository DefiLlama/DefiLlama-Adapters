const ADDRESSES = require('../helper/coreAssets.json')
const { function_view } = require('../helper/chain/aptos')

const TRUSTAKE_APT_CONTRACT_ADDR = "0x6f8ca77dd0a4c65362f475adb1c26ae921b1d75aa6b70e53d0e340efd7d8bc80"
const MODULE = "staker"
const FUNCTION = "total_staked"

async function aptosTvl(api) {
  const totalStaked = await function_view({ functionStr: `${TRUSTAKE_APT_CONTRACT_ADDR}::${MODULE}::${FUNCTION}` })
  api.add(ADDRESSES.aptos.APT, totalStaked[0])
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

module.exports = {
  methodology: `Counts the TVL of MATIC tokens in TruFin's TruStake vault.`,
  ethereum: {
    tvl
  },
  aptos: {
    tvl: aptosTvl
  }
}

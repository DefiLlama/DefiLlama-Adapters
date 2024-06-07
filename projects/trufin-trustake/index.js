const ADDRESSES = require('../helper/coreAssets.json')
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
  }
}

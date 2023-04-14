const abi = require('./abi.json')

const TRUSTAKE_CONTRACT_ADDR = "0xcfab8530ccf1f9936daede537d6ebbc75289006d"
const MATIC_TOKEN_ADDR = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"

async function tvl(timestamp, block, chainBlocks, { api }) {
  const totalShares = (await api.call({ abi: abi.totalShares, target: TRUSTAKE_CONTRACT_ADDR, }))
  const sharePrice = (await api.call({ abi: abi.sharePrice, target: TRUSTAKE_CONTRACT_ADDR, }))
  const dust = (await api.call({ abi: abi.getDust, target: TRUSTAKE_CONTRACT_ADDR, }))

  api.add(MATIC_TOKEN_ADDR, (totalShares * sharePrice / 1e18) + +dust)
}

module.exports = {
  methodology: `Counts the TVL of MATIC tokens in TruFin's TruStake vault.`,
  ethereum: {
    tvl
  }
}

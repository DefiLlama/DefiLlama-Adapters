
const RWA_STAKING = "0xdbd03d676e1cf3c3b656972f88ed21784372acab"
const RESERVE_STAKING = "0xba0ae7069f94643853fce3b8af7f55acbc11e397"
const SBTC = "0x094c0e36210634c3CfA25DC11B96b562E0b07624"
const STONE = "0x7122985656e38bdc0302db86685bb972b145bd3c"

async function tvl(api) {
  // Get allowed stablecoins from RWA Staking
  const stablecoins = await api.call({    target: RWA_STAKING,    abi: 'address[]:getAllowedStablecoins',  })
  const ownerTokens = [[stablecoins, RWA_STAKING], [[SBTC, STONE], RESERVE_STAKING]]
  return api.sumTokens({ ownerTokens})
}

module.exports = {
  methodology: "Counts total value locked in both RWA Staking (stablecoins) and Reserve Staking (SBTC and STONE) contracts",
  ethereum: { tvl }
}
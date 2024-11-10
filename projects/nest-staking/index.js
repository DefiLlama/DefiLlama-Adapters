const RWA_STAKING = "0xdbd03d676e1cf3c3b656972f88ed21784372acab"
const RESERVE_STAKING = "0xba0ae7069f94643853fce3b8af7f55acbc11e397"
const SBTC = "0x094c0e36210634c3cfa25dc11b96b562e0b07624"  // Our SBTC
const STONE = "0x7122985656e38bdc0302db86685bb972b145bd3c"
const SBTC_PRICE = "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6"  // sBTC for price

async function tvl(api) {

  // Get SBTC balance directly first to verify
  const sbtcBalance = await api.call({
    target: SBTC,
    abi: 'erc20:balanceOf',
    params: [RESERVE_STAKING]
  })

  // Get balances
  const balances = await api.sumTokens({ 
    ownerTokens: [
      [[STONE], RESERVE_STAKING],
    ]
  })

  // Add SBTC balance manually
  if (sbtcBalance) {
    balances[SBTC_PRICE] = sbtcBalance
  }

  
  return balances
}

module.exports = {
  methodology: "Counts total value locked in both RWA Staking (stablecoins) and Reserve Staking (SBTC and STONE) contracts. SBTC price is derived from sBTC token.",
  ethereum: { tvl }
}
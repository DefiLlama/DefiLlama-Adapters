const RWA_STAKING = "0xdbd03d676e1cf3c3b656972f88ed21784372acab"
const RESERVE_STAKING = "0xba0ae7069f94643853fce3b8af7f55acbc11e397"
const SBTC = "0x094c0e36210634c3cfa25dc11b96b562e0b07624"
const STONE = "0x7122985656e38bdc0302db86685bb972b145bd3c"
const STAKESTONE_VAULT_ETH = '0x7dBAC0aA440A25D7FB43951f7b178FF7A809108D'

const vaultABI = {
  "getDepositAmounts": "function getDepositAmounts() view returns (address[], uint256[])"
}

async function tvl(api) {
  // Get stablecoins for RWA_STAKING
  const stablecoins = await api.call({
    target: RWA_STAKING,
    abi: 'address[]:getAllowedStablecoins',
  })

  // Get RESERVE_STAKING data in parallel
  const [
    [btcTokens, btcAmounts],
    [nestSbtcBalance, sbtcTotalSupply],
    baseBalances
  ] = await Promise.all([
    api.call({ 
      abi: vaultABI.getDepositAmounts, 
      target: STAKESTONE_VAULT_ETH 
    }),
    Promise.all([
      api.call({
        target: SBTC,
        abi: 'erc20:balanceOf',
        params: [RESERVE_STAKING]
      }),
      api.call({
        target: SBTC,
        abi: 'erc20:totalSupply'
      })
    ]),
    api.sumTokens({ 
      ownerTokens: [
        [[STONE], RESERVE_STAKING],
        [stablecoins, RWA_STAKING]
      ]
    })
  ])

  // Calculate SBTC share if we have a balance
  if (nestSbtcBalance > 0n && sbtcTotalSupply > 0n) {
    const nestShare = (BigInt(nestSbtcBalance) * BigInt(1e18)) / BigInt(sbtcTotalSupply)
    
    // Calculate adjusted BTC amounts based on our SBTC share
    const adjustedBtcAmounts = btcAmounts.map(balance => 
      ((BigInt(balance) * nestShare) / BigInt(1e18)).toString()
    )

    // Add BTC token balances with normalized addresses
    btcTokens.forEach((token, index) => {
      baseBalances[`ethereum:${token.toLowerCase()}`] = adjustedBtcAmounts[index]
    })
  }

  return baseBalances
}

module.exports = {
  methodology: "Counts total value locked in RWA Staking (stablecoins) and Reserve Staking (SBTC and STONE). BTC token values are calculated based on the protocol's SBTC share.",
  ethereum: { tvl }
}
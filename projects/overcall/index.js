const OVER = '0x6245Db7f52379bD9757c9DdcE6519768FfaB3a4F' // the protocol's own token
const USDG = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'
const OVER_STAKING = '0x2165E659406F6B4F122F10A540B634252249b306'
const OVER_VAULT = '0xFB4C6062c24313E2E8Cf01D1CCBa0B940e7b29f6'
const USDG_VAULT = '0x526b07940694f599aA2e9DbDE30540BE004aC80e'
const VAULTS_DEPLOYED = 1792452600 // 2026-10-19 23:30 UTC, after both vaults were deployed (block 93002929)

// players' and creators' funds in a vault: its balance less the protocol's capital and revenue (tracked as treasury)
async function addUserFunds(api, vault, token) {
  if (api.timestamp && api.timestamp < VAULTS_DEPLOYED) return
  const balance = await api.call({ abi: 'erc20:balanceOf', target: token, params: [vault] })
  const capital = await api.call({ abi: 'uint256:capital', target: vault })
  const revenue = await api.call({ abi: 'uint256:revenue', target: vault })
  const userFunds = BigInt(balance) - BigInt(capital) - BigInt(revenue)
  if (userFunds < 0n) throw new Error(`vault ${vault} holds less than its capital + revenue`)
  api.add(token, userFunds)
}

module.exports = {
  methodology: 'TVL counts the USDG that players and channel creators hold in the USDG vault (open positions, unclaimed royalties, held wins): the vault balance less the protocol\'s own capital and fee revenue, which are tracked as treasury. Staking counts the $OVER staked in the staking contract, plus the players\' and creators\' $OVER in the $OVER vault, worked out the same way.',
  start: '2026-09-18', // first full day after the first stake (block 65482061, 2026-09-17 15:41 UTC)
  robinhood: {
    tvl: (api) => addUserFunds(api, USDG_VAULT, USDG),
    staking: async (api) => {
      await api.sumTokens({ owners: [OVER_STAKING], tokens: [OVER] })
      await addUserFunds(api, OVER_VAULT, OVER)
    },
  },
}

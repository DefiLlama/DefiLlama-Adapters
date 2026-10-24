const { nullAddress } = require('../helper/sumTokens')

const RESERVE = '0x437bCF676D11FFE5542BfAa842b560e431285065' // the $OVER reserve wallet (100M of the 150M vault liquidity)
const OVER = '0x6245Db7f52379bD9757c9DdcE6519768FfaB3a4F'
const OVER_VAULT = '0xFB4C6062c24313E2E8Cf01D1CCBa0B940e7b29f6'
const USDG = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'
const USDG_VAULT = '0x526b07940694f599aA2e9DbDE30540BE004aC80e'
const VAULTS_DEPLOYED = 1792452600 // 2026-10-19 23:30 UTC, after both vaults were deployed (block 93002929)

// the protocol's part of a vault: its capital and the fee revenue not withdrawn yet (players' funds are in projects/overcall)
async function addOwned(api, vault, token) {
  if (api.timestamp && api.timestamp < VAULTS_DEPLOYED) return
  api.add(token, await api.call({ abi: 'uint256:capital', target: vault }))
  api.add(token, await api.call({ abi: 'uint256:revenue', target: vault }))
}

module.exports = {
  robinhood: {
    tvl: async (api) => {
      await api.sumTokens({ owners: [RESERVE], tokens: [nullAddress, USDG] })
      await addOwned(api, USDG_VAULT, USDG)
    },
    ownTokens: async (api) => {
      await api.sumTokens({ owners: [RESERVE], tokens: [OVER] })
      await addOwned(api, OVER_VAULT, OVER)
    },
  },
}

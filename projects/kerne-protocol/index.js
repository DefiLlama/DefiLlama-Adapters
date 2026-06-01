// Kerne Protocol — DefiLlama TVL Adapter (Base, chainId 8453)
// ----------------------------------------------------------------
// TVL = USDC reserves held by the live KUSDPSM, which back circulating kUSD 1:1.
// This is Kerne's live, user-facing deposit surface and matches the protocol's
// published headline TVL at kerne.fi/api/stats and the reserve breakdown at
// kerne.fi/api/por (policy: docs/SEED_TVL_POLICY.md).
//
// The v1 KerneVault (0x8005bc7A86AD904C20fd62788ABED7546c1cF2AC) is intentionally
// NOT counted: it is in a known degraded accounting state (share supply does not
// reconcile with its WETH backing), deposits are disabled pending a v2 redeploy,
// and KerneVault.totalAssets() additionally includes off-chain CEX / Hyperliquid
// hedge balances that are not on-chain TVL. The vault leg will be re-added once
// KerneVault v2 redeploys in a healthy, on-chain-reconciled state.
//
// Contracts (verified on Basescan):
//   KUSDPSM: 0xFf3025ec18e301855aB0f36Ec6ECa115a29A5Fbc
//   kUSD:    0x5C2EfdF0D8D286959b42308966bc2B97f5680AA3

const ADDRESSES = require('../helper/coreAssets.json')

const KUSD_PSM = '0xFf3025ec18e301855aB0f36Ec6ECa115a29A5Fbc';

async function tvl(api) {
  await api.sumTokens({ tokensAndOwners: [[ADDRESSES.base.USDC, KUSD_PSM]]})
}

module.exports = {
  methodology:
    'TVL is the USDC reserve held by the Kerne KUSDPSM contract on Base, which backs all circulating kUSD 1:1. This is the protocol\'s live, user-facing deposit surface and matches the published headline TVL at kerne.fi/api/stats.',
  base: { tvl },
};

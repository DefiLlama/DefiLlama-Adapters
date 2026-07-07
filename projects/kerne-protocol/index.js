const ADDRESSES = require('../helper/coreAssets.json')

// The v1 KerneVault (0x8005bc7A86AD904C20fd62788ABED7546c1cF2AC) is intentionally
// NOT counted: it is in a known degraded accounting state (share supply does not
// reconcile with its WETH backing), deposits are disabled pending a v2 redeploy,
// and KerneVault.totalAssets() additionally includes off-chain CEX / Hyperliquid
// hedge balances that are not on-chain TVL.

const KUSD_PSM_MINT = '0x07eBb486e11BD217e6085eb5ab663e4517595993';
const KUSD_PSM_REDEEM = '0xFf3025ec18e301855aB0f36Ec6ECa115a29A5Fbc';

async function tvl(api) {
  await api.sumTokens({ tokens: [ADDRESSES.base.USDC], owners: [KUSD_PSM_MINT, KUSD_PSM_REDEEM] })
}

module.exports = {
  methodology:
    'TVL is the USDC reserve held by Kerne\'s Peg Stability Module (PSM) contracts on Base, which back all circulating kUSD 1:1. kUSD is minted 1:1 from USDC through the mint PSM (0x07eBb486) and redeemed 1:1 back to USDC through the redeem PSM (0xFf3025ec); both hold USDC backing and are summed. The kUSD supply itself is not added (counting both would double count). This matches the published headline TVL at kerne.fi/api/stats. The v1 KerneVault is intentionally excluded: it is in a known degraded accounting state, deposits are disabled pending a v2 redeploy, and its totalAssets() includes off-chain hedge balances that are not on-chain TVL.',
  base: { tvl },
};

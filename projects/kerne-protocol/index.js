const ADDRESSES = require('../helper/coreAssets.json')

// Kerne mints kUSD 1:1 from USDC through a Peg Stability Module (PSM). The USDC
// received sits in the PSM contract and backs circulating kUSD 1:1, so TVL is the
// sum of USDC held across Kerne's PSM contracts. The kUSD supply itself is not
// added (that would double count). This matches the published headline TVL at
// kerne.fi/api/stats and the reserve breakdown at kerne.fi/api/por.
//
// The mint PSM is rotated across module upgrades and each PSM retains the USDC it
// received, so every PSM that holds reserves is summed:
//   PSM (live mint)   0xaBDE1138aa1Ce88d1dF06422C0c3b05D70569803  current minter (MINTER_ROLE on kUSD)
//   PSM (prior mint)  0x07eBb486e11BD217e6085eb5ab663e4517595993  retains USDC from earlier mints
//   PSM (redeem)      0xFf3025ec18e301855aB0f36Ec6ECa115a29A5Fbc  redeem reserve
// If the minter is rotated again, add the new PSM address here.
//
// The v1 KerneVault (0x8005bc7A86AD904C20fd62788ABED7546c1cF2AC) is intentionally
// NOT counted: it has been superseded by a v2 redeploy and its deposits are
// disabled, and KerneVault.totalAssets() reports off-chain balances that are not
// part of the on-chain PSM reserves.

const KUSD_PSM_MINT = '0xaBDE1138aa1Ce88d1dF06422C0c3b05D70569803';        // live mint PSM (current minter)
const KUSD_PSM_MINT_PRIOR = '0x07eBb486e11BD217e6085eb5ab663e4517595993'; // prior mint PSM (retains earlier USDC)
const KUSD_PSM_REDEEM = '0xFf3025ec18e301855aB0f36Ec6ECa115a29A5Fbc';     // redeem reserve

async function tvl(api) {
  await api.sumTokens({ tokens: [ADDRESSES.base.USDC], owners: [KUSD_PSM_MINT, KUSD_PSM_MINT_PRIOR, KUSD_PSM_REDEEM] })
}

module.exports = {
  methodology:
    'TVL is the USDC reserve held by Kerne\'s Peg Stability Module (PSM) contracts on Base, which back all circulating kUSD 1:1. kUSD is minted 1:1 from USDC through the live mint PSM (0xaBDE1138) and redeemed 1:1 back to USDC through the redeem PSM (0xFf3025ec); a prior mint PSM (0x07eBb486) still retains USDC from earlier mints. All PSM USDC reserves are summed; the kUSD supply itself is not added (that would double count). This matches the published headline TVL at kerne.fi/api/stats. The v1 KerneVault is intentionally excluded: it has been superseded by a v2 redeploy, its deposits are disabled, and its totalAssets() reports off-chain balances that are not part of the on-chain PSM reserves.',
  base: { tvl },
};

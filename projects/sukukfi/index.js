/**
 * SukukFi — Berachain
 *
 * Two products, one protocol:
 * - duPRT (investment layer, ERC-7575): Mudarabah profit-share vaults financing telecom invoice
 *   receivables. `totalAssets()` on these vaults deliberately excludes pending deposits,
 *   claimable redemptions, cancellations, AND already-invested capital — it is not a TVL figure,
 *   it's an "available for investment" helper (see ERC7575VaultUpgradeable.sol NatSpec on
 *   totalAssets()). The complete on-chain balance held by a duPRT vault, regardless of state, is
 *   just its raw ERC20 balance — the same value the contract's own getVaultMetrics() calls
 *   `grossAssetBalance`.
 * - trUST (settlement layer, WERC7575): a 1:1 permissioned settlement token for CommTrade telecom
 *   invoice settlement. No yield, by design.
 *
 * Once a duPRT vault invests idle assets (investAssets()), the capital physically moves into the
 * matching trUST vault for the same asset — confirmed on-chain: a duPRT vault's `investmentVault`
 * field points directly at trUST's vault for that asset. trUST's totalAssets() is a plain
 * balanceOf(this), so it already captures any duPRT-invested capital once it moves. Summing
 * duPRT's raw balance (everything still sitting there, any state) + trUST's raw balance (native
 * settlement capital + anything duPRT has already invested) counts every dollar exactly once.
 */
const ADDRESSES = require('../helper/coreAssets.json');

// duPRT (investment layer) vaults — proxy addresses, from the SukukFi frontend-integration handoff.
const DUPRT_VAULTS = [
  ['0x549943e04f40284185054145c6E4e9568C1D3241', '0x1B610abd3dFA170fdC579c48da7007217c06149D'], // USDC.e
  ['0x779Ded0c9e1022225f8E0630b35a9b54bE713736', '0x3d6D8D7e66594f3cFbbF2c65dcE305edCD325f7e'], // USD₮0
  ['0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce', '0xdc9D7e60f3091029FA2479919325385a56F2A2F8'], // HONEY
];

// trUST (settlement layer / WERC7575) vaults — internal, not for UI calls, but real on-chain TVL.
const TRUST_VAULTS = [
  ['0x549943e04f40284185054145c6E4e9568C1D3241', '0x23953876A0f7c367B0Ae5E8b9cFb6b42E503F09b'], // USDC.e
  ['0x779Ded0c9e1022225f8E0630b35a9b54bE713736', '0x3ddECA146B3179367cC1d782889f938f449c9d21'], // USD₮0
  ['0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce', '0xC441d4c5F060f96bD7CD20d3D13Ecf957Ea308C7'], // HONEY
];

async function tvl(api) {
  return api.sumTokens({ tokensAndOwners: [...DUPRT_VAULTS, ...TRUST_VAULTS] });
}

module.exports = {
  methodology: 'Sums the raw ERC20 balance held by SukukFi\'s duPRT (investment layer) and trUST '
    + '(settlement layer) vaults on Berachain. This equals duPRT\'s grossAssetBalance (idle + '
    + 'pending + claimable + cancelled — everything not yet invested elsewhere) plus trUST\'s '
    + 'totalAssets (native settlement capital plus any duPRT-invested capital, since investing '
    + 'moves the underlying asset into the matching trUST vault). No double counting: money is '
    + 'either still in a duPRT vault or has moved to trUST, never both.',
  berachain: {
    tvl,
  },
};

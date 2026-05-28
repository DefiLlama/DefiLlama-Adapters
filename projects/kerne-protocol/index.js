const ADDRESSES = require('../helper/coreAssets.json')

const KERNE_VAULT = '0x8005bc7A86AD904C20fd62788ABED7546c1cF2AC';
const KUSD_PSM = '0xFf3025ec18e301855aB0f36Ec6ECa115a29A5Fbc';
const USDC_BASE = ADDRESSES.base.USDC;

async function tvl(api) {
  await api.sumTokens({ tokensAndOwners: [[ADDRESSES.base.USDC, KUSD_PSM]]})
  await api.erc4626Sum2({ calls: [KERNE_VAULT]})
}

module.exports = {
  methodology:
    'TVL is the sum of two on-chain surfaces on Base: (1) KerneVault.totalAssets() in its underlying asset (WETH), and (2) USDC reserves held by the KUSDPSM contract backing outstanding kUSD 1:1. The vault WETH backs kLP shares; the PSM USDC backs kUSD. Both are protocol-controlled deposit surfaces. The kUSD supply itself is NOT added, because counting it would double-count the PSM USDC reserves that already back it.',
  base: { tvl },
};

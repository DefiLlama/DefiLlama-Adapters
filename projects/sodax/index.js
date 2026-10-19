const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache');

const SPOKE_CONFIG_URL = 'https://api.sodax.com/v1/be/config/spoke/all-chains-configs';

const chainIdToName = {
  1: 'ethereum',
  43114: 'avax',
  42161: 'arbitrum',
  8453: 'base',
  10: 'optimism',
  56: 'bsc',
  137: 'polygon',
  999: 'hyperliquid',
  1890: 'lightlink_phoenix',
  8217: 'klaytn',
  295: 'hedera',
};

// Build { chainSlug: { owner, tokens } } from the live SODAX config, fetched once
// per run and shared across chains.
let _spokeConfigPromise;
function getSpokeConfig() {
  if (!_spokeConfigPromise) _spokeConfigPromise = buildSpokeConfig();
  return _spokeConfigPromise;
}

async function buildSpokeConfig() {
  const raw = await getConfig('sodax', SPOKE_CONFIG_URL);
  const byChain = {};
  for (const entry of Object.values(raw)) {
    if (entry?.chain?.type !== 'EVM') continue;
    const name = chainIdToName[entry.chain.chainId];
    if (!name) continue;
    const owner = entry.addresses?.assetManager;
    const tokens = [...new Set(Object.values(entry.supportedTokens || {}).map((t) => t.address))];
    if (!owner || !tokens.length) continue;
    byChain[name] = { owner, tokens };
  }
  return byChain;
}

async function tvl(api) {
  const cfg = (await getSpokeConfig())[api.chain];
  if (!cfg) throw new Error(`sodax: no spoke config for ${api.chain}`);
  return sumTokens2({ api, owner: cfg.owner, tokens: cfg.tokens });
}

// Sonic (hub) side. The sodaX vaults hold the Sonic-native underlying tokens
// (USDC/USDT/WETH/wS). Other soda* vaults are excluded because their underlying
// is already counted on the spoke AssetManager, so counting the hub wrapper too
// would double count.
const sonicHubVaults = [
  [[ADDRESSES.sonic.USDC_e], '0xAbbb91c0617090F0028BDC27597Cd0D038F3A833'], // sodaUSDC -> USDC
  [[ADDRESSES.sonic.USDT], '0xbDf1F453FCB61424011BBDDCB96cFDB30f3Fe876'], // sodaUSDT -> USDT
  [['0x50c42dEAcD8Fc9773493ED674b675bE577f2634b'], '0x4effB5813271699683C25c734F4daBc45B363709'], // sodaETH  -> WETH
  [[ADDRESSES.sonic.wS], '0x62ecc3Eeb80a162c57624B3fF80313FE69f5203e'], // sodaS    -> wS
];

async function sonicTvl(api) {
  return sumTokens2({ api, ownerTokens: sonicHubVaults });
}

// Sonic-only: staked SODA.
// SODAX staking uses a two-level vault: user deposits SODA -> receives stSoda
// (1:1 liquid staking token) -> stSoda is auto-deposited into the xSoda ERC-4626
// vault (`asset() = stSoda`, `totalAssets()` = total stSoda under management,
// which equals total SODA staked). Neither contract holds SODA directly, so
// a naive `balanceOf(SODA)` on either address returns 0. Use the vault's
// `totalAssets()` to get the true staked amount (matches the SDK's
// `getStakedSodaAmount` -> `totalStaked` field).
const SODA_SONIC = '0x7c7d53EEcda37a87ce0D5bf8E0b24512A48dC963';
const XSODA = '0xADC6561Cc8FC31767B4917CCc97F510D411378d9';

async function sonicStaking(api) {
  const totalStaked = await api.call({ target: XSODA, abi: 'uint256:totalAssets' });
  api.add(SODA_SONIC, totalStaked);
}

module.exports = {
  methodology:
    'TVL sums assets custodied by the SODAX AssetManager on each supported blockchain network plus the Sonic-native assets held in the hub-side sodaVariants (sodaUSDC, sodaUSDT, sodaETH, sodaS). Per-network AssetManager addresses and supported-token sets are pulled live from the SODAX spoke config API. Money-market supplied collateral is not counted separately because it is the same wrapped representation of assets already locked on the AssetManagers. Independent solver inventory is external and excluded. Staked SODA is reported under staking as the xSODA vault totalAssets (the SDK-canonical "totalStaked" figure). SODAX is live on 21 blockchain networks total; this adapter currently covers the 12 EVM networks. Non-EVM networks (Solana, Bitcoin, Stellar, Sui, ICON, NEAR, Stacks, Injective) and Redbelly will be added in follow-up PRs.',
};

Object.values(chainIdToName).forEach((chain) => {
  module.exports[chain] = { tvl };
});

module.exports.sonic = { tvl: sonicTvl, staking: sonicStaking };

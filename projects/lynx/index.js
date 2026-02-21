/**
 * Lynx Protocol - DefiLlama TVL Adapter
 *
 * Lynx is a multi-chain derivatives protocol for perpetual trading
 * and binary options with liquidity pool management.
 *
 * TVL = settlement assets deposited in LexPool (perps) + LiquidityPoolV2 (options)
 *
 * Pools hold "chip" tokens (wrapped representations of source-chain assets).
 * We read the chip balance and map it back to the original token for pricing.
 */

const ADDRESSES = require('../helper/coreAssets.json');

// -- ABIs --
const TOTAL_ASSETS_ABI = "uint256:totalAssets"; // Options V2 pool: returns TVL

// -- Chain ID to DefiLlama chain name --
const CHAIN_NAME = {
  146: "sonic",
  288: "boba",
};

// ============================================================
//  SONIC — Perps Pools (LexPool)
// ============================================================
// Each entry: [poolAddress, chipAddress, originalTokenAddress, sourceChainId]
// When sourceChainId === 146 (sonic), the token is native to sonic.
const SONIC_PERPS_POOLS = [
  ["0x0720F76645bdd96838139ca8bB5b3AC9217EccE4", "0x0e7a7a477ab4dDFB2d7a500D33c38A19372a70Fc", ADDRESSES.sonic.wS, 146],       // wS
  ["0x4738D724F3f8Ebec0F363c630E23eC814efD1D6E", "0x4461913eCa88EDE2d76B576C8fA5D08535bb714A", "0x005851f943ee2957b1748957f26319e4f9edebc1", 146],   // AG
  ["0x0DdF9aF077bB85a74E504721B32eC6189Cb10b22", "0xb02bD75a0814585ba7c4d5a1C421b092aDF96da0", ADDRESSES.sonic.USDC_e, 146],   // USDC
  ["0xC295820e5c35e2b2c678CA9D0Fd84D1691A7f0A1", "0x8A5e46c8dE8c301201af475DbEF7cF4fA6Cc71F2", "0xbf5899166ac476370b3117c9256b7fc45624f4ea", 146],   // GFI
  ["0x62D4CFCf3475c575b5E9CA3dfDdA8eCA99Fb37BD", "0x1444E226a93eE7228A7634D3101413a4d1AEa4bd", "0x7A0C53F7eb34C5BC8B01691723669adA9D6CB384", 146],   // BOO
  ["0xD86636FA9a010E62a904c92810A0AC8041040584", "0x443D0a82De44FDF8236D40d72A40486c804764b9", "0xa95ea1cfabccf0e9eb94b646cefe9ed71ff5d605", 146],   // xBOO
  ["0x042675c5a2129Eb6D1f5Fe8Ce7E00235977aF7dD", "0xb0D87B27282501E64Ffa575aaED393c373Ee24b8", "0xa04bc7140c26fc9bb1f36b1a604c7a5a88fb0e70", 146],   // SWPx
  ["0x0929CFF984b3497CFE15a8a1fF940B65CFFC1d3D", "0x73c0EeA1faDd305d9A7e0a4c8943B16Adff0a04A", ADDRESSES.sonic.scUSD, 146],    // scUSD
  ["0x5f687742DDf4067B79667E52CB2a62175A1A5f22", "0x4A6132bb6a3c001937581822479474F2aE4C855d", "0x9F0dF7799f6FDAd409300080cfF680f5A23df4b1", 146],   // wOS
  ["0xeA334D47C366a9aBAa39BDcBA77dd6f10D1531f1", "0xaec5a1f07B459c50a0dfd5001798DC8b683b6023", "0xe6cc4D855B4fD4A9D02F46B9adae4C5EfB1764B5", 146],   // LUDWIG
  ["0x07775efcf73e31CdED88E239FdF6bB1Cf4eCBB55", "0x5e9aAC66C5CF0d1035f9213A2De323aFcA19653a", ADDRESSES.sonic.STS, 146],      // stS
  ["0x726cFDcfb77a911C31E4C57958C0EEE314c9807e", "0x83E2e4ca591c7f1f77588C684A83a0b5C92Ac377", "0x71E99522EaD5E21CF57F1f542Dc4ad2E841F7321", 146],   // METRO
  ["0x6E9D974d76F883cfeE60aFE322679474db223553", "0x1423D2dc2a8E884b4535b349aD4B724b9a6F0FA1", "0x6c9B3A74ae4779da5Ca999371eE8950e8DB3407f", 146],   // FLY
  ["0xf66D9B8A85928FB087FE95a3f2b5a3EAAAc5838e", "0xd50995818ac9E1Fa49Eed8E560a42Bc5970A7c61", "0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5", 146],   // RZR
];

// ============================================================
//  SONIC — Options V2 Pool
// ============================================================
const SONIC_OPTIONS_POOLS = [
  // [poolAddress, assetAddress]
  ["0xe875c6987df6e0c38d2e18a67ae5061f921df417", ADDRESSES.sonic.wS], // wS
];

// ============================================================
//  BOBA — Perps Pools (LexPool)
// ============================================================
const BOBA_PERPS_POOLS = [
  ["0x27b66f41E8ba74fF804C8b4D983b137D78D559a4", "0xcDD339d704Fb8f35A3a2f7d9B064238D33DC7550", ADDRESSES.boba.USDC, 288],     // USDC
  ["0xDa9de011c65376CA2D7bd902Ce05a48b85D93175", "0x9beABD8699E2306c5632C80E663dE9953e104C3f", ADDRESSES.boba.BOBA, 288],     // BOBA
  ["0x881cc6150f9d30C4B003A7aecfB38Ea3Bca69C3D", "0x222a41942ac89533C77cC0c7C185E056CdA76e2e", "0x52E4d8989fa8b3E1C06696e7b16DEf5d7707A0d1", 288], // bobaETH
];

// ============================================================
//  BOBA — Options V2 Pool
// ============================================================
const BOBA_OPTIONS_POOLS = [
  ["0xc56726980981fb2ace7454b6f9ecff2d04bad4f6", ADDRESSES.boba.BOBA], // BOBA
];

// ============================================================
//  TVL Calculation
// ============================================================

/**
 * Calculate TVL for LexPool (perps) pools.
 *
 * Each pool holds a "chip" token representing the source-chain asset.
 * We read the chip balance held by the pool and map it to the original
 * token on its source chain so DefiLlama can price it correctly.
 */
async function perpsPoolsTvl(api, pools) {
  const engineChainId = api.getChainId();

  // Read chip balances held by each pool
  const balances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: pools.map(([pool, chip]) => ({ target: chip, params: [pool] })),
  });

  // Read decimals of chip tokens and original tokens to rescale
  const chipDecimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: pools.map(([, chip]) => chip),
  });
  const originalDecimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: pools.map(([, , originalToken]) => originalToken),
  });

  for (let i = 0; i < pools.length; i++) {
    const [, , originalToken, sourceChainId] = pools[i];
    const balance = BigInt(balances[i]);
    const chipDec = Number(chipDecimals[i]);
    const origDec = Number(originalDecimals[i]);

    // Balance is in chip-token decimals but will be interpreted using original token decimals.
    // Rescale: if chip has 18 decimals and original has 6, divide by 10^12.
    const decDiff = chipDec - origDec;
    const adjusted = decDiff > 0
      ? balance / BigInt(10 ** decDiff)
      : balance * BigInt(10 ** (-decDiff));

    if (sourceChainId === engineChainId) {
      api.add(originalToken, adjusted.toString());
    } else {
      const chainName = CHAIN_NAME[sourceChainId];
      if (chainName) {
        api.add(`${chainName}:${originalToken}`, adjusted.toString());
      }
    }
  }
}

/**
 * Calculate TVL for Options V2 liquidity pools.
 *
 * These are ERC-4626-style vaults. We call totalAssets() which returns
 * the total settlement assets held, and map to the asset token.
 */
async function optionsPoolsTvl(api, pools) {
  const totalAssets = await api.multiCall({
    abi: TOTAL_ASSETS_ABI,
    calls: pools.map(([pool]) => pool),
  });

  for (let i = 0; i < pools.length; i++) {
    const [, assetAddress] = pools[i];
    api.add(assetAddress, totalAssets[i]);
  }
}

// ============================================================
//  Chain TVL Functions
// ============================================================

async function sonicTvl(api) {
  await perpsPoolsTvl(api, SONIC_PERPS_POOLS);
  await optionsPoolsTvl(api, SONIC_OPTIONS_POOLS);
}

async function bobaTvl(api) {
  await perpsPoolsTvl(api, BOBA_PERPS_POOLS);
  await optionsPoolsTvl(api, BOBA_OPTIONS_POOLS);
}

// ============================================================
//  Module Exports
// ============================================================

module.exports = {
  methodology:
    "TVL is the sum of settlement assets deposited in Lynx perpetual trading liquidity pools (LexPool) and binary options liquidity pools (LiquidityPoolV2) across all supported chains.",
  sonic: {
    tvl: sonicTvl,
  },
  boba: {
    tvl: bobaTvl,
  },
  fantom: { tvl: () => ({}) },
  fuse: { tvl: () => ({}) },
  linea: { tvl: () => ({}) },
  arbitrum: { tvl: () => ({}) },
  optimism: { tvl: () => ({}) },
  mantle: { tvl: () => ({}) },
  polygon: { tvl: () => ({}) },
  bsc: { tvl: () => ({}) },
  mode: { tvl: () => ({}) },
  celo: { tvl: () => ({}) },
  zircuit: { tvl: () => ({}) },
  ethereum: { tvl: () => ({}) },
};
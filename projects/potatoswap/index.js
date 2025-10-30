const { getUniTVL } = require("../helper/unknownTokens");
const { sumTokens2 } = require('../helper/unwrapLPs');

// --- V2 ---
const v2Factory = "0x630db8e822805c82ca40a54dae02dd5ac31f7fcf"
const v2Tvl = getUniTVL({
    factory: v2Factory,
    useDefaultCoreAssets: true,
});

// --- V3 (Dynamic NFPM Traversal Method) ---

// Contract Addresses
const v3Factory = "0xa1415fAe79c4B196d087F02b8aD5a622B8A827E5"
const v3NFPM = "0xE6b5d25cc857c956bA20B73f4e21a1F1397947d8" // NonfungiblePositionManager

// ABIs required for traversal
const abi = {
  NFPM: {
    totalSupply: "uint256:totalSupply",
    tokenByIndex: "function tokenByIndex(uint256 index) view returns (uint256)",
    // positions (tokenId) returns: (nonce, operator, token0, token1, fee, ...)
    positions: "function positions(uint256 tokenId) view returns (uint96, address, address, address, uint24, int24, int24, uint128, uint256, uint256, uint128, uint128)"
  },
  Factory: {
    getPool: "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)"
  }
}

/**
 * Dynamic V3 TVL function.
 * Discovers pools by iterating through all NFTs in the NonfungiblePositionManager.
 * This method completely bypasses the problematic eth_getLogs.
 */
async function getV3Tvl(api) {
  // 1. Get the total number of LP NFTs
  const nftTotalSupply = await api.call({
    target: v3NFPM,
    abi: abi.NFPM.totalSupply,
  });

  // 2. Build multicall to get all NFT token IDs
  const nftTokenIds = await api.multiCall({
    target: v3NFPM,
    abi: abi.NFPM.tokenByIndex,
    calls: Array.from({ length: Number(nftTotalSupply) }, (_, i) => i),
  });

  // 3. Build multicall to get position info (token0, token1, fee) for all NFTs
  const positionData = await api.multiCall({
    target: v3NFPM,
    abi: abi.NFPM.positions,
    calls: nftTokenIds,
  });

  // 4. De-duplicate to find all unique pool "recipes" (token0, token1, fee)
  const uniquePools = new Map();
  positionData.forEach(pos => {
    // pos[2] is token0, pos[3] is token1, pos[4] is fee
    const key = `${pos[2]}-${pos[3]}-${pos[4]}`;
    if (!uniquePools.has(key)) {
      uniquePools.set(key, {
        token0: pos[2],
        token1: pos[3],
        fee: pos[4]
      });
    }
  });

  // 5. Build multicall to get the actual pool addresses from the factory
  const poolAddresses = await api.multiCall({
    target: v3Factory,
    abi: abi.Factory.getPool,
    calls: Array.from(uniquePools.values()).map(p => ({
      params: [p.token0, p.token1, p.fee]
    }))
  });

  // 6. Format the data for sumTokens2: [ [token0, token1], poolAddress ]
  const ownerTokens = [];
  const pools = Array.from(uniquePools.values());
  poolAddresses.forEach((poolAddress, i) => {
    ownerTokens.push([
      [pools[i].token0, pools[i].token1], // tokens
      poolAddress                       // owner (the pool itself)
    ]);
  });

  // 7. Calculate TVL using the discovered pools
  // sumTokens2 will fetch balances at the current api.block height
  const balances = await sumTokens2({ api, ownerTokens });
  const floatBalances = Object.fromEntries(
    Object.entries(balances).map(([key, value]) => [key, parseFloat(value)])
  );
  return floatBalances;
}

module.exports = {
  xlayer: {
    tvl: async (api) => {
      // Run V2 and V3 TVL calculations in parallel
      const [v2Balances, v3Balances] = await Promise.all([
        v2Tvl(api),
        getV3Tvl(api), // Call our new dynamic V3 function
      ]);

      // Add both V2 and V3 balances
      api.addBalances(v2Balances);
      api.addBalances(v3Balances);
      return api.getBalances();
    },
  },
  misrepresentedTokens: true,
}
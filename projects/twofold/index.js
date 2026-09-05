const ethers = require("ethers");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Twofold runs DualPool (Uniswap v4 hook) pools on Robinhood Chain. Every pool is
// listed in the Registry; the hook holds each pool's two-sided reserves itself
// (raw ERC-20, ERC-6909 claims in the PoolManager, and USDG parked in ERC4626
// vaults), so TVL is the sum of hook.getReserves over every listing.
// Two stacks are live: the 2026-09 stack takes every new deposit, the 2026-08
// stack stays withdrawable and several of its keys still hold depositors, so
// both Registries are read. Reserves are counted whether or not a key is still
// flagged active: an inactive key with shares outstanding still holds funds.
const REGISTRIES = ["0xdF1a23B1A7507Cc3B270DfA78FDD9ddA7bC36325", "0x1b66DD14C9281A18E696dbdb40cFB5070842c0C2"];
const TWO = "0x2A4a33A2163D005d8E7f1D9aC08d14c98db288d5";
const STAKING_VAULT_V2 = "0x06E463fDa4BEb4aA096142E673240aB9719fB3A9";
const TWO_STAKING_USDG = "0x9CF18bB1dD9AfBF75B579Cc0C473B2975c16E9e3";
// vTWO is the 1:1 governance wrapper; the TWO it holds is locked for voting.
const VTWO = "0x5c02401e945d86FB7109EC77F358498D6DA05950";
// TWO is priced by CoinGecko (id twofold); its Robinhood Chain address is not in
// the coins service, so every TWO balance is re-keyed to the CoinGecko id.
const TWO_CG_ID = "twofold";
const POSITION_LOCKER = "0x485690D46e344127aa2EB45D8d9BAcbb5856D58b";
const GENESIS_POSITION_ID = 1076283;

// The Registry stores fee but not tickSpacing; the key is recovered by matching
// keccak256(abi.encode(key)) against the listed poolId.
const TICK_SPACINGS = [60, 1, 10, 200, 2, 30, 100];
const POOL_KEY_TYPE = "tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks)";
const coder = ethers.AbiCoder.defaultAbiCoder();

const abi = {
  allPoolIds: "function allPoolIds() view returns (bytes32[])",
  getPool: "function getPool(bytes32 poolId) view returns (tuple(address hook, bytes32 poolId, address currency0, address currency1, uint24 fee, address vault0, address vault1, uint8 mode, bool verified, bool active))",
  totalStaked: "function totalStaked() view returns (uint256)",
  getReserves: "function getReserves(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key) view returns (uint256 token0, uint256 token1)",
};

function priceTwoViaCoinGecko(api) {
  const key = Object.keys(api.getBalances()).find((k) => k.toLowerCase() === ("robinhood:" + TWO).toLowerCase());
  if (!key) return;
  const raw = api.getBalances()[key];
  api.removeTokenBalance(TWO);
  api.addCGToken(TWO_CG_ID, Number(raw) / 1e18);
}

function resolveKey(listing) {
  for (const tickSpacing of TICK_SPACINGS) {
    const key = [listing.currency0, listing.currency1, listing.fee, tickSpacing, listing.hook];
    const id = ethers.keccak256(coder.encode([POOL_KEY_TYPE], [key]));
    if (id.toLowerCase() === listing.poolId.toLowerCase()) return key;
  }
  return null;
}

async function tvl(api) {
  const calls = [];
  for (const registry of REGISTRIES) {
    const ids = await api.call({ target: registry, abi: abi.allPoolIds });
    const listings = await api.multiCall({ target: registry, abi: abi.getPool, calls: ids });
    for (const listing of listings) {
      const key = resolveKey(listing);
      if (!key) throw new Error("tickSpacing not recoverable for pool " + listing.poolId);
      calls.push({ target: listing.hook, params: [key] });
    }
  }
  const reserves = await api.multiCall({ abi: abi.getReserves, calls });
  reserves.forEach(({ token0, token1 }, i) => {
    api.add(calls[i].params[0][0], token0);
    api.add(calls[i].params[0][1], token1);
  });

  // The genesis TWO/WETH launch position (Uniswap v4 NFT) is permanently held by
  // PositionLocker, which has no transfer, decrease or burn path.
  await sumTokens2({ api, owner: POSITION_LOCKER, resolveUniV4: true, uniV4ExtraConfig: { positionIds: [GENESIS_POSITION_ID] } });
  priceTwoViaCoinGecko(api);
}

async function stakingTvl(api) {
  const staked = await api.multiCall({ abi: abi.totalStaked, calls: [STAKING_VAULT_V2, TWO_STAKING_USDG] });
  staked.forEach((amount) => api.add(TWO, amount));
  await sumTokens2({ api, owner: VTWO, tokens: [TWO] });
  priceTwoViaCoinGecko(api);
}

module.exports = {
  methodology:
    "TVL is the two-sided reserves of every Twofold DualPool pool, read from the hook (getReserves) for each pool listed in either Twofold Registry (the 2026-09 stack and the 2026-08 stack, both live), plus the permanently locked TWO/WETH genesis position in Uniswap v4. Staking is totalStaked TWO in the two staking vaults (StakingVaultV2 and TwoStakingUSDG) plus the TWO held by the vTWO governance wrapper; undistributed reward balances are excluded. Marked doublecounted because the hook keeps its reserves as ERC-6909 claims in the Uniswap v4 PoolManager and as deposits in the Steakhouse USDG vaults (Morpho), and the genesis position sits in a Uniswap v4 pool, all of which are counted by those listings.",
  doublecounted: true,
  start: "2026-08-28",
  robinhood: {
    tvl,
    staking: stakingTvl,
  },
};

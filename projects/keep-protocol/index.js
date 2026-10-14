const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2 } = require("../helper/solana");
const { getLogs2 } = require("../helper/cache/getLogs");
const { addUniV3LikePosition } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const PROGRAM_IDS = [
  new PublicKey("ETVtC29T7ExxYyWSkpzKPxzrL3SRyrGPRhZe3FwXmFAo"), // Full Launch
  new PublicKey("2ww3589FBTgwbCd9sbpBjosiDszsigoqArh5xuc7F2Ve"), // Idea Mode
];

// Robinhood Chain production deployments. Each project is an independent
// Launchpad clone that directly holds refundable Paxos USDG. Keep both the
// original production factory and the current metadata-v1 factory so TVL
// remains continuous across the factory migration.
const RH_FACTORIES = [
  { address: "0x032EAfc08388283e94E44Fb0eA26A004D44ba40d", fromBlock: 10334365 }, // original production factory
  { address: "0xC3f2831429F51aCe9243aCe75819488e3566CA7b", fromBlock: 86016310 }, // metadata-v1 factory
];

const RH_STATE_VIEW = "0xF3334192D15450CdD385c8B70e03f9A6bD9E673b";
const RH_PROJECT_CREATED = "event ProjectCreated(uint64 indexed projectId, address indexed launchpad, address indexed token, address creator, uint8 mode)";
const RH_BOOTSTRAPPED = "event Bootstrapped(bytes32 indexed poolId, uint256 launchTs, uint128 liquidity, int24 launchTick)";
const RH_POOL_KEY = "function poolKey() view returns (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks)";
const RH_SLOT0 = "function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)";
const RH_POSITION_INFO = "function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128)";
const ZERO_SALT = `0x${"0".repeat(64)}`;
const MIN_TICK = -887272;
const MAX_TICK = 887272;

// Anchor account discriminator for LaunchpadState (base58 of the first 8 bytes).
const LAUNCHPAD_DISC = "VgW83Wf4icd";

// Byte offset of the `usdc_vault` Pubkey within LaunchpadState data (incl. 8-byte disc).
const OFF_USDC_VAULT = 80;

async function tvl(api) {
  const connection = getConnection();

  // Full Launch and Idea Mode use separate mainnet programs but the same
  // LaunchpadState layout and refundable USDC-vault accounting model.
  const accountGroups = await Promise.all(PROGRAM_IDS.map((programId) =>
    connection.getProgramAccounts(programId, {
      filters: [{ memcmp: { offset: 0, bytes: LAUNCHPAD_DISC } }],
      dataSlice: { offset: OFF_USDC_VAULT, length: 32 },
    })
  ));

  // Fundraising/Cancelled hold the full raise, HoldPeriod holds the ~10k refund reserve, Failed holds the
  // refund pool, and Success has ~0 here (its reserve was paid out) — so no per-state filtering is needed
  // and the Raydium pool is never double-counted.
  const usdcVaults = new Set();
  for (const { account } of accountGroups.flat()) {
    const data = account.data;
    if (data.length < 32) continue;
    const vault = new PublicKey(data);
    if (vault.equals(PublicKey.default)) continue; // vault not initialized yet
    usdcVaults.add(vault.toString());
  }

  await sumTokens2({ api, tokenAccounts: [...usdcVaults] });
}

async function robinhoodTvl(api) {
  const launchpadLists = await Promise.all(RH_FACTORIES.map(({ address }) => api.fetchList({
    target: address,
    lengthAbi: "uint64:nextProjectId",
    itemAbi: "function launchpadOf(uint64) view returns (address)",
  })));
  const launchpads = [...new Set(launchpadLists.flat())];

  await api.sumTokens({ owners: launchpads, tokens: [ADDRESSES.robinhood.USDG] });

  // RH Full seeds a full-range position in the singleton Uniswap V4
  // PoolManager. There is no per-pool ERC20 balance, so derive the position's
  // current reserves from StateView and the live tick. The launched token side
  // is excluded; it is minted by Keep and has no independent collateral value.
  const launches = [];
  for (const { address, fromBlock } of RH_FACTORIES) {
    const created = await getLogs2({ api, target: address, eventAbi: RH_PROJECT_CREATED, fromBlock, extraKey: "projects" });
    for (const log of created) {
      const bootstrapped = await getLogs2({ api, target: log.launchpad, eventAbi: RH_BOOTSTRAPPED, fromBlock, extraKey: "bootstrapped" });
      for (const boot of bootstrapped) launches.push({ launchpad: log.launchpad, token: log.token, poolId: boot.poolId });
    }
  }
  if (!launches.length) return;

  const keys = await api.multiCall({ abi: RH_POOL_KEY, calls: launches.map(({ launchpad }) => ({ target: launchpad })) });
  const live = launches.map((launch, i) => {
    const key = keys[i];
    const currency0 = key?.currency0 ?? key?.[0];
    const currency1 = key?.currency1 ?? key?.[1];
    const tickSpacing = Number(key?.tickSpacing ?? key?.[3]);
    if (!currency0 || !currency1 || !tickSpacing) return null;
    if (currency0.toLowerCase() !== launch.token.toLowerCase()) return null;
    if (currency1.toLowerCase() !== ADDRESSES.robinhood.USDG.toLowerCase()) return null;
    return {
      ...launch,
      token0: currency0,
      token1: currency1,
      tickLower: Math.trunc(MIN_TICK / tickSpacing) * tickSpacing,
      tickUpper: Math.trunc(MAX_TICK / tickSpacing) * tickSpacing,
    };
  }).filter(Boolean);
  if (!live.length) return;

  const [slot0, positions] = await Promise.all([
    api.multiCall({ abi: RH_SLOT0, target: RH_STATE_VIEW, calls: live.map(({ poolId }) => ({ params: [poolId] })) }),
    api.multiCall({
      abi: RH_POSITION_INFO,
      target: RH_STATE_VIEW,
      calls: live.map(({ poolId, launchpad, tickLower, tickUpper }) => ({ params: [poolId, launchpad, tickLower, tickUpper, ZERO_SALT] })),
    }),
  ]);

  live.forEach((launch, i) => {
    const slot = slot0[i];
    const liquidity = Number(positions[i]?.liquidity ?? positions[i]?.[0] ?? 0);
    if (!slot || !liquidity || slot.tick === undefined) return;
    addUniV3LikePosition({
      api,
      token0: launch.token0,
      token1: launch.token1,
      liquidity,
      tickLower: launch.tickLower,
      tickUpper: launch.tickUpper,
      tick: Number(slot.tick),
    });
    api.removeTokenBalance(launch.token0);
  });
}

module.exports = {
  methodology:
    "TVL is the refundable stablecoin held in keep.coffee's per-launch vaults/contracts, plus the USDG side of RH Full's full-range Uniswap V4 launch positions. " +
    "It covers active raises, post-bootstrap refund reserves, cancelled-raise balances and failed-raise refund pools; the launched-token side of each pool is excluded because it is minted by Keep and has no independent collateral value. " +
    "The RH V4 liquidity is also counted by the underlying Uniswap V4 listing.",
  doublecounted: true,
  timetravel: false,
  solana: { tvl },
  robinhood: { tvl: robinhoodTvl },
};

const { getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Foci — token launchpad on Arc (chain id 5042). Contracts: https://github.com/yonzaynator/foci
const FACTORY = "0xa392D6eca5242715517eeCd43406aeD19424FAC0"; // FociLaunchFactory
const LAUNCH_LOCKER = "0x539fD9e6a6316B65bEd9dDb9A570959e0bc8C31A"; // FociLaunchLocker (holds the V4 LP NFTs forever)
const POSITION_MANAGER = "0x6049c9a0e26405c0985f9e3685c87d0ae917f82b"; // Uniswap V4 PositionManager on Arc
const STATE_VIEW = "0xF3334192D15450CdD385c8B70e03f9A6bD9E673b"; // Uniswap V4 StateView on Arc
// Arc's USDC as the 6-decimal ERC-20 view token. The same funds are also visible as the 18-decimal
// native ledger (0x0000…); every Foci launch is quoted in the view token, so only this one is counted.
const USDC = "0x3600000000000000000000000000000000000000";
const FACTORY_START_BLOCK = 20883999;

const ABI = {
  tokenLaunched:
    "event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)",
  positionLocked: "event PositionLocked(address indexed token, uint256 indexed tokenId)",
  // Real USDC held by the curve: excludes the virtual phantom reserve and the accrued fee/tax buckets.
  realQuoteReserve: "uint256:realQuoteReserve",
  getLaunchedToken:
    "function getLaunchedToken(address) view returns ((address token, address curve, address deployer, address creatorFeeRecipient, address pairToken, uint256 graduationThreshold, uint24 poolFee, int24 tickSpacing, uint16 creatorTaxBps, uint8 phase, uint256 sweptQuote, uint256 sweptTokens, uint256 sweptAt, bool exists))",
};

async function tvl(api) {
  const launches = await getLogs2({ api, target: FACTORY, eventAbi: ABI.tokenLaunched, onlyArgs: true, fromBlock: FACTORY_START_BLOCK });
  // The native-USDC quote path exists in the contracts but was never approved on mainnet; a launch on
  // any other quote would need its own accounting, so it is skipped rather than miscounted.
  const usdcLaunches = launches.filter((l) => l.pairToken.toLowerCase() === USDC);
  const tokens = usdcLaunches.map((l) => l.token);
  const curves = usdcLaunches.map((l) => l.curve);

  // 1. Live bonding curves. Graduated curves answer 0 (their reserve moved to the pool), so no
  //    phase branching — which also keeps a curve whose auto-graduation failed correctly counted.
  const reserves = await api.multiCall({ abi: ABI.realQuoteReserve, calls: curves, permitFailure: true });
  reserves.forEach((r) => api.add(USDC, r ?? 0));

  // 2. USDC parked on the factory between a curve completing and its pool being minted (phase 1).
  const infos = await api.multiCall({ abi: ABI.getLaunchedToken, target: FACTORY, calls: tokens, permitFailure: true });
  infos.forEach((info) => {
    if (info && +info.phase === 1) api.add(USDC, info.sweptQuote);
  });

  // 3. The USDC leg of every full-range V4 position the locker holds. Launched tokens are
  //    protocol-minted, so their leg is blacklisted; DefiLlama's resolver reads the pool key
  //    (including the hook) from the PositionManager and prices the position at the current tick.
  const locked = await getLogs2({ api, target: LAUNCH_LOCKER, eventAbi: ABI.positionLocked, onlyArgs: true, fromBlock: FACTORY_START_BLOCK });
  const positionIds = locked.map((l) => l.tokenId.toString());
  if (positionIds.length === 0) return api.getBalances();
  return sumTokens2({
    api,
    resolveUniV4: true,
    uniV4ExtraConfig: { nftAddress: POSITION_MANAGER, stateViewer: STATE_VIEW, positionIds, blacklistedTokens: tokens },
    blacklistedTokens: tokens,
  });
}

module.exports = {
  methodology:
    "TVL is the USDC (Arc ERC-20 view token 0x3600…0000) held on behalf of traders: (1) the real USDC reserve of every live Foci bonding curve (realQuoteReserve, which excludes the virtual phantom reserve and accrued fee/tax buckets); (2) the USDC leg of the permanently locked full-range Uniswap V4 position of every graduated token; (3) USDC briefly held by the launch factory between curve completion and pool creation. Launched memecoins are protocol-minted and excluded on both the curve and pool side. Accrued but unclaimed trading fees (curve fee buckets, hook pending fees, FociFeeEscrow, holder-reward distributors) are revenue, not TVL, and are excluded.",
  start: "2026-09-14",
  timetravel: true,
  hallmarks: [
    ["2026-09-14", "Arc mainnet deployment"],
    ["2026-09-16", "Public launching opened"],
  ],
  arc: { tvl },
};

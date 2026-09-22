const { getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Foci — token launchpad on Arc (chain id 5042). Contracts: https://github.com/yonzaynator/foci
const FACTORY = "0xa392D6eca5242715517eeCd43406aeD19424FAC0"; // FociLaunchFactory
const LAUNCH_LOCKER = "0x539fD9e6a6316B65bEd9dDb9A570959e0bc8C31A"; // FociLaunchLocker (holds the V4 LP NFTs forever)
const POSITION_MANAGER = "0x6049c9a0e26405c0985f9e3685c87d0ae917f82b"; // Uniswap V4 PositionManager on Arc
const STATE_VIEW = "0xF3334192D15450CdD385c8B70e03f9A6bD9E673b"; // Uniswap V4 StateView on Arc
// A launch is quoted in one of the factory's approved pair tokens (USDC as the 6-decimal ERC-20 view
// token 0x3600…, WETH, XAUM, cirBTC, EURC, …); every balance below is keyed by the launch's own quote.
// The native-USDC quote path (pairToken = 0x0, the 18-decimal ledger of the same funds as 0x3600…)
// exists in the contracts but was never approved on mainnet; it is skipped explicitly so USDC is only
// ever counted through the view token.
const NATIVE = "0x0000000000000000000000000000000000000000";
const FACTORY_START_BLOCK = 20883999;

const ABI = {
  tokenLaunched:
    "event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)",
  lockedPositions: "function lockedPositions(address) view returns (uint256)",
  // Real quote held by the curve: excludes the virtual phantom reserve and the accrued fee/tax buckets.
  realQuoteReserve: "uint256:realQuoteReserve",
  getLaunchedToken:
    "function getLaunchedToken(address) view returns ((address token, address curve, address deployer, address creatorFeeRecipient, address pairToken, uint256 graduationThreshold, uint24 poolFee, int24 tickSpacing, uint16 creatorTaxBps, uint8 phase, uint256 sweptQuote, uint256 sweptTokens, uint256 sweptAt, bool exists))",
};

async function tvl(api) {
  // Launches are event-only on the factory (no enumeration view). Arc's public RPCs refuse log
  // ranges of 10,000 blocks or more, so the range is capped below that.
  const all = await getLogs2({ api, target: FACTORY, eventAbi: ABI.tokenLaunched, fromBlock: FACTORY_START_BLOCK, onlyArgs: true, maxBlockRange: 5_000 });
  const launches = all.filter((l) => l.pairToken.toLowerCase() !== NATIVE);
  const tokens = launches.map((l) => l.token);
  const quotes = launches.map((l) => l.pairToken);

  // 1. Live bonding curves, each in its own quote. Graduated curves answer 0 (their reserve moved to
  //    the pool), so no phase branching — which also keeps a curve whose auto-graduation failed
  //    correctly counted.
  const reserves = await api.multiCall({ abi: ABI.realQuoteReserve, calls: launches.map((l) => l.curve) });
  reserves.forEach((r, i) => api.add(quotes[i], r));

  // 2. Quote parked on the factory between a curve completing and its pool being minted (phase 1).
  const infos = await api.multiCall({ abi: ABI.getLaunchedToken, target: FACTORY, calls: tokens });
  infos.forEach((info, i) => {
    if (+info.phase === 1) api.add(quotes[i], info.sweptQuote);
  });

  // 3. The quote leg of every full-range V4 position the locker holds (the locker maps token →
  //    position id, 0 while not graduated). Only the quote assets are whitelisted, so the
  //    protocol-minted launch token on the other side is never counted.
  const lockedIds = await api.multiCall({ abi: ABI.lockedPositions, target: LAUNCH_LOCKER, calls: tokens });
  const positionIds = lockedIds.filter((id) => +id !== 0);
  if (positionIds.length === 0) return;
  return sumTokens2({
    api,
    resolveUniV4: true,
    uniV4ExtraConfig: { nftAddress: POSITION_MANAGER, stateViewer: STATE_VIEW, positionIds, whitelistedTokens: [...new Set(quotes)] },
  });
}

module.exports = {
  methodology:
    "TVL is the quote asset held on behalf of traders, counted in each launch's own quote (USDC as the Arc ERC-20 view token 0x3600…0000, WETH, XAUM, cirBTC, EURC): (1) the real quote reserve of every live Foci bonding curve (realQuoteReserve, which excludes the virtual phantom reserve and accrued fee/tax buckets); (2) the quote leg of the permanently locked full-range Uniswap V4 position of every graduated token; (3) quote briefly held by the launch factory between curve completion and pool creation. Launched memecoins are protocol-minted and excluded on both the curve and pool side. Accrued but unclaimed trading fees (curve fee buckets, hook pending fees, FociFeeEscrow, holder-reward distributors) are revenue, not TVL, and are excluded.",
  start: "2026-09-14",
  timetravel: true,
  arc: { tvl },
};

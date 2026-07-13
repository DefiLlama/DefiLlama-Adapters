const { nullAddress } = require("../helper/unwrapLPs");
const { sumUnknownTokens } = require("../helper/unknownTokens");

// SLVR — 1-minute on-chain grid lottery + jackpot + veNFT staking + LP staking.
// Deployed on Robinhood Chain (Arbitrum Orbit L2, chainId 4663). Native gas/wager token is ETH.
// Addresses are from the live production deployment.
const SLVR = "0x791229E3EbD6CFdC3D8157f48722684173C29aD9"; // SlvrToken (ERC20 reward token)
const WETH = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73"; // wrapped ETH on Robinhood Chain
const SLVR_ETH_LP = "0xe365b92239097Ed3322131411DbE15a5c4068eff"; // SLVR/WETH UniswapV2 pair

// SLVR has no external price feed, so it is priced from the SLVR/WETH pair reserves against WETH.
// restrictTokenRatio caps how much SLVR value can exceed the pool's depth, guarding against
// over-valuation off the protocol's own (currently thin) liquidity.
const priceConfig = { coreAssets: [WETH], lps: [SLVR_ETH_LP], restrictTokenRatio: 10 };

// Contracts custodying protocol assets on behalf of users: live round pots + carry pools, the
// accumulating jackpot, pending staker rewards, auto-commit user deposits, locked winnings, and
// undistributed growth-fund SLVR. We sweep both native ETH and SLVR held here — the SLVR held by
// the lottery is winner emissions that have been minted but not yet claimed (owed to users).
const gameContracts = [
  "0x284Eb4016305Fa7FbC162Fb68F27227271001c7f", // SlvrGridLottery (round pots + carry + unclaimed emissions)
  "0x24b723e2da172961f60cd6a4699654c89d4ac6cd", // SlvrJackpot (jackpot pool)
  "0xaF68598eBd245DC3cB92FF16E9Ba1814DD137200", // SlvrVoteEscrowStaking (pending veNFT ETH rewards)
  "0x314c8D5755468224AC60c36FB5494F0D7D5Abb3B", // SlvrAutoCommitV2 (user deposits)
  "0x1399115FcF2a9C41e5080547A9214156A4Bf8a45", // SlvrAutoCommit legacy (user deposits)
  "0x2fD3BE762eb9d8eE293dD923D8809Dbd3D653dd7", // SlvrClaimLocker (locked winnings)
  "0x1a1633fdb2f19082099a6ad6c3d4f1ec6bce9729", // SlvrGrowthFund (undistributed SLVR revenue)
];

// SLVR locked by users into non-transferable vote-escrow NFTs (normal, withdrawable locks). Held on
// the contract, so counted at its actual balance. (Permanent locks burn their SLVR to reduce supply,
// so they are not held by any contract and are intentionally excluded from TVL/staking.)
const voteEscrow = "0xd9b8FBD61033145c5496132153CE675756313B71"; // SlvrVoteEscrow
// SLVR/WETH LP staked for ETH rewards.
const liquidityStaking = "0x7D888f4Ca88Fc3578aEfc45C82482Bd66415DfeA"; // SlvrLiquidityStaking

async function tvl(api) {
  return sumUnknownTokens({ api, owners: gameContracts, tokens: [nullAddress, SLVR], ...priceConfig });
}

async function staking(api) {
  return sumUnknownTokens({ api, owner: voteEscrow, tokens: [SLVR], ...priceConfig });
}

async function pool2(api) {
  return sumUnknownTokens({ api, owner: liquidityStaking, tokens: [SLVR_ETH_LP], resolveLP: true, ...priceConfig });
}

module.exports = {
  methodology:
    "TVL sums the native ETH and SLVR held by the SLVR game contracts on behalf of users: live round pots and carry pools plus unclaimed winner emissions (SlvrGridLottery), the accumulating jackpot (SlvrJackpot), pending veNFT staker rewards (SlvrVoteEscrowStaking), auto-commit user deposits (SlvrAutoCommit), locked winnings (SlvrClaimLocker) and undistributed growth-fund revenue (SlvrGrowthFund). Staking counts SLVR locked into withdrawable vote-escrow NFTs held by SlvrVoteEscrow; permanently-locked SLVR is burned (removed from supply, held by no contract) and so is excluded. Pool2 counts SLVR/WETH LP staked in SlvrLiquidityStaking. SLVR has no external price feed and is priced from the SLVR/WETH pair reserves against WETH.",
  robinhood: { tvl, staking, pool2 },
};

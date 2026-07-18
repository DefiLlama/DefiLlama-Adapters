// STEEL — grid-mining lottery + veSTEEL staking on Robinhood Chain (chainId 4663).
// Mirrors the SLVR adapter layout (chain key `robinhood`, split into tvl/staking/pool2).
//   tvl     = native ETH held by the mine (auto-deploy escrow + pending winnings + motherlode)
//   staking = STEEL locked in the veSTEEL staking contract
//   pool2   = protocol-owned STEEL/ETH LP (100% burned, permanent)

const STEEL = "0x0AF77e27F535256965944E617a386570f5C0432a";
const VE_STEEL = "0xD5116ca699eD6CA186BC07f46B3c851D1A483aa2";
const MINE = "0xB089d11432F219495A4278acd6446B7Faefa2bA6";
const LP = "0x2d86d7329EEC64BBaD520631D6716a4fB41BD52a";
const NATIVE = "0x0000000000000000000000000000000000000000"; // ETH

async function tvl(api) {
  // native ETH held by the mine contract (escrow + pending + motherlode)
  await api.sumTokens({ owner: MINE, tokens: [NATIVE] });
  return api.getBalances();
}

async function staking(api) {
  // STEEL staked into veSTEEL
  await api.sumTokens({ owner: VE_STEEL, tokens: [STEEL] });
  return api.getBalances();
}

async function pool2(api) {
  // permanent (burned) protocol liquidity: STEEL + WETH sitting in the LP pair
  const [token0, token1] = await Promise.all([
    api.call({ target: LP, abi: "address:token0" }),
    api.call({ target: LP, abi: "address:token1" }),
  ]);
  await api.sumTokens({ owner: LP, tokens: [token0, token1] });
  return api.getBalances();
}

module.exports = {
  methodology:
    "tvl = native ETH held by the mine (auto-deploy escrow, pending winnings, motherlode). staking = STEEL locked in the veSTEEL staking contract. pool2 = the protocol-owned STEEL/ETH LP, which is 100% burned.",
  robinhood: { tvl, staking, pool2 },
};

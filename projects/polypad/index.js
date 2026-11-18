const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");

// Polypad — token launchpad + tokenized funds on Robinhood Chain (chain 4663).
// https://polypad.family
//
// TVL DEFINITION
// ==============
// 1. Staking — the staked principal (`totalStaked`) in every pool created by
//    the two staking factories. Pools are enumerated from the factories
//    on-chain, so new pools are picked up automatically. `totalStaked` is
//    the staked principal only: pool contracts also hold reward tokens,
//    which are NOT counted.
// 2. Fund vaults — the ETH (+ POLYDASH) held by the live tokenized-fund
//    vaults (Polyfund and Polycat Growth Fund).
//
// NO DOUBLE-COUNTING: fund vaults hold no staked positions (verified
// on-chain — both vaults hold 0 POLYDASH), and pool `totalStaked` never
// includes vault funds.
//
// EXCLUDED (deliberately, not an oversight):
// - Launch bonding-curve holdings: transient trade flow, not locked
//   protocol TVL. The launch factory holds 0 ETH.
// - BuybackVault (fee accumulator, ~0).
// - x402 facilitator / SpendVault (user funds in transit, not protocol TVL).
// - Uniswap V4 pool liquidity itself (that is Uniswap's TVL, not Polypad's).
//
// PRICING NOTE — POLYDASH is priced from the on-chain Uniswap V4
// POLYDASH/WETH pool (via StateView.getSlot0) and added as WETH, because
// DeFiLlama has no POLYDASH price feed yet and CoinGecko's simple-price API
// for `defidash` returns ~$0.00054, which is ~2,790x the true on-chain price
// (~$0.0000002). `misrepresentedTokens` is set for exactly this reason.
// Once DeFiLlama prices POLYDASH natively, this adapter can add the raw
// POLYDASH balances instead and drop the conversion.

const POLYDASH = "0x319525528f42167eF7fC18b77b889958080568e4";
const WETH = ADDRESSES.robinhood.WETH;

// Uniswap V4 POLYDASH/WETH pool (1% fee, no hook). PoolManager.getSlot0
// reverts on this chain's deployment, so the price is read from StateView,
// which is the same source the DeFiLlama uniswapV4 helper uses for robinhood.
const STATE_VIEW = "0xf3334192d15450cdd385c8b70e03f9a6bd9e673b";
const POLYDASH_WETH_POOL_ID =
  "0xc37d18932ac3bf4d8482ae1b210bbc640a367e708fedda95cfa6724f685274b5";

// Staking factories (V1 legacy, V2 current). Both expose poolsLength() and
// on-chain pool enumeration.
const STAKING_FACTORY_V1 = "0x904b8F5d95B593b5F4a6Dbb116b58e1d5CBe93f0";
const STAKING_FACTORY_V2 = "0x4C87aff7009DE1c58E052FEe202349a10b28Be9c";

// Live tokenized-fund vaults.
const FUND_VAULTS = [
  "0xbcC982b6A5ABbBb5d94cCE7e772E923F88d29dD9", // Polyfund (PDGFUND)
  "0x7d8d3308f54777f5b56fc3efb2afeffe925dfdd2", // Polycat Growth Fund (PCATFUND)
];

const abi = {
  poolsLength: "function poolsLength() external view returns (uint256)",
  allPools: "function allPools(uint256) external view returns (address)",
  getPoolAddresses:
    "function getPoolAddresses(uint256 offset, uint256 limit) external view returns (address[])",
  totalStaked: "function totalStaked() external view returns (uint256)",
  stakeToken: "function stakeToken() external view returns (address)",
  getSlot0:
    "function getSlot0(bytes32 poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)",
};

async function tvl(api) {
  // 1. Enumerate staking pools from both factories on-chain.
  const [v1Count, v2Count] = await api.multiCall({
    abi: abi.poolsLength,
    calls: [{ target: STAKING_FACTORY_V1 }, { target: STAKING_FACTORY_V2 }],
  });
  const v1Pools = await api.multiCall({
    abi: abi.allPools,
    calls: Array.from({ length: Number(v1Count) }, (_, i) => ({
      target: STAKING_FACTORY_V1,
      params: [i],
    })),
  });
  const v2Pools = await api.call({
    target: STAKING_FACTORY_V2,
    abi: abi.getPoolAddresses,
    params: [0, Number(v2Count)],
  });
  const pools = [...v1Pools, ...v2Pools];

  // 2. Read each pool's stake token and staked principal.
  const stakeTokens = await api.multiCall({
    abi: abi.stakeToken,
    calls: pools.map((pool) => ({ target: pool })),
  });
  const staked = await api.multiCall({
    abi: abi.totalStaked,
    calls: pools.map((pool) => ({ target: pool })),
  });

  // 3. Price POLYDASH from the on-chain V4 pool.
  //    WETH per POLYDASH = (2^96 / sqrtPriceX96)^2, so
  //    wethWei = polydashWei * 2^192 / sqrtPriceX96^2.
  const slot0 = await api.call({
    target: STATE_VIEW,
    abi: abi.getSlot0,
    params: [POLYDASH_WETH_POOL_ID],
  });
  const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96 ?? slot0[0]);
  const Q192 = 2n ** 192n;
  const polydashToWeth = (polydashWei) =>
    (BigInt(polydashWei) * Q192) / (sqrtPriceX96 * sqrtPriceX96);

  let polydashStaked = 0n;
  pools.forEach((pool, i) => {
    if (stakeTokens[i].toLowerCase() === POLYDASH.toLowerCase()) {
      polydashStaked += BigInt(staked[i]);
    } else {
      // Non-POLYDASH stake token (e.g. SWARM): add raw; DeFiLlama prices
      // it if it can. (0 staked today.)
      api.add(stakeTokens[i], staked[i]);
    }
  });
  api.add(WETH, polydashToWeth(polydashStaked));

  // 4. Fund vaults: native ETH plus any POLYDASH they hold (0 today).
  // Single api.call reads, not a multiCall: the SDK's batched balanceOf
  // path fails on robinhood with "Bad encoding" (test.js, Nov 18) even
  // though direct balanceOf calls and Multicall3.aggregate both return
  // the correct 0 — so read each vault directly.
  const { output: ethBalances } = await sdk.api.eth.getBalances({
    targets: FUND_VAULTS,
    chain: api.chain,
    block: api.block,
  });
  ethBalances.forEach(({ balance }) => api.addGasToken(balance));

  let vaultPolydashTotal = 0n;
  for (const vault of FUND_VAULTS) {
    const bal = await api.call({
      target: POLYDASH,
      abi: "erc20:balanceOf",
      params: [vault],
    });
    vaultPolydashTotal += BigInt(bal);
  }
  if (vaultPolydashTotal > 0n) api.add(WETH, polydashToWeth(vaultPolydashTotal));
}

module.exports = {
  methodology:
    "TVL is the staked principal (totalStaked) in every pool of the two Polydash staking factories, enumerated on-chain, plus the ETH and POLYDASH held by the live tokenized-fund vaults (Polyfund, Polycat). POLYDASH is converted to WETH at the on-chain Uniswap V4 POLYDASH/WETH pool price because DeFiLlama has no POLYDASH price feed and CoinGecko's price for it is ~2,790x wrong. Excluded: launch bonding-curve flow, BuybackVault, x402 facilitator/SpendVault, and V4 pool liquidity.",
  misrepresentedTokens: true,
  robinhood: {
    tvl,
  },
};

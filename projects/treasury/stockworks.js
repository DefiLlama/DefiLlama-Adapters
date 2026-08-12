const { nullAddress, treasuryExports } = require("../helper/treasury");

// StockWorks (SPCXSTR) — Robinhood Chain.
//
// A 10% pool-level swap tax on SPCXSTR funds a treasury that market-makes SPCX
// (Robinhood tokenized SpaceX stock) against USDG, and converts the harvested
// LP fees into SPCXSTR buy-and-burn.
//
// This cannot be a plain registry entry: almost the entire treasury sits inside
// a CONCENTRATED Uniswap v4 liquidity position, which is custodied by the v4
// PoolManager singleton and therefore invisible to ERC20 balanceOf. Summing
// balances alone reports ~$100 against ~$30k actually held. So we read the
// controller's own position getters and convert liquidity to token amounts.
const CONTROLLER = "0x37bBFeD61d9A8C3743D3E7318e635c37c9abdf8e"; // SpcxQuoteController
const SPCX = "0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa";
const USDG = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";

// SPCXSTR itself is the protocol's own token and is deliberately NOT counted.

module.exports = {
  methodology:
    "Treasury of the SpcxQuoteController: the concentrated Uniswap v4 SPCX/USDG liquidity position it market-makes with (valued by converting position liquidity into its underlying SPCX and USDG at the pool's current price), plus any idle SPCX, USDG and native ETH held by the controller. The protocol's own token, SPCXSTR, is excluded.",
  robinhood: {
    tvl: async (api) => {
      // idle balances held directly by the controller
      const base = treasuryExports({
        robinhood: {
          owners: [CONTROLLER],
          tokens: [nullAddress, SPCX, USDG],
        },
      });
      await base.robinhood.tvl(api);

      // the concentrated v4 position
      const [liquidity, tickLower, tickUpper, sqrtPriceX96] = await Promise.all([
        api.call({ target: CONTROLLER, abi: "function positionLiquidity() view returns (uint128)" }),
        api.call({ target: CONTROLLER, abi: "function tickLower() view returns (int24)" }),
        api.call({ target: CONTROLLER, abi: "function tickUpper() view returns (int24)" }),
        api.call({ target: CONTROLLER, abi: "function venueSqrtPrice() view returns (uint160)" }),
      ]);

      const L = Number(liquidity);
      if (L > 0) {
        // sqrt(price) ratios; ticks are log-price so sqrt(1.0001^tick) = 1.0001^(tick/2)
        const sqrtP = Number(sqrtPriceX96) / 2 ** 96;
        const sqrtLower = Math.pow(1.0001, Number(tickLower) / 2);
        const sqrtUpper = Math.pow(1.0001, Number(tickUpper) / 2);
        // clamp to the range: below it the position is all token0, above all token1
        const sqrtC = Math.min(Math.max(sqrtP, sqrtLower), sqrtUpper);

        const amount0 = L * (1 / sqrtC - 1 / sqrtUpper); // SPCX, 18 decimals
        const amount1 = L * (sqrtC - sqrtLower); // USDG, 6 decimals

        api.add(SPCX, amount0);
        api.add(USDG, amount1);
      }

      return api.getBalances();
    },
  },
};

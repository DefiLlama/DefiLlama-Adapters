const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");

const FACTORY = "0x98d1130e04846a082Ca1e88379075F9741241078";

module.exports = {
  methodology: "Counts tokens locked in Machima DEX liquidity pools (Uniswap V3 fork on Base).",
  base: {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: FACTORY,
        topics: ["0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118"],
        fromBlock: 47460700,
        eventAbi: "event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)",
        onlyArgs: true,
      });

      if (logs.length > 0) {
        return sumTokens2({
          api,
          ownerTokens: logs.map((i) => [[i.token0, i.token1], i.pool]),
          permitFailure: true,
        });
      }

      // Fallback: known pools when factory events are not indexed (proxy pattern)
      const pools = [
        {
          pool: "0x531aAE7d71343C663821604c57520b1602567006",
          tokens: [
            "0xA4985Faeb1e64Ba215282255dBb78ff59C63d7A9", // XMA
            "0x4200000000000000000000000000000000000006", // WETH
          ],
        },
      ];

      return sumTokens2({
        api,
        ownerTokens: pools.map((p) => [p.tokens, p.pool]),
      });
    },
  },
};

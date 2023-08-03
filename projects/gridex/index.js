const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");
const { stakings } = require("../helper/staking");

const stakingContract = ["0x035E9062286FD19460B3E22970ebB5691EED2C25"];
const GDX = ["0x2F27118E3D2332aFb7d165140Cf1bB127eA6975d"];

module.exports = {
  methodology: `Counts the tokens locked on order book grid`,
  hallmarks: [
    [1672531200, "GDX Airdrop #1"],
    [1677628800, "GDX Airdrop #2"],
    [1678838400, "Maker Rewards Launch"],
    [1679616000, "GDX Airdrop #3"],
    [1682294400, "GDX Staking Launch"],
    [1682550000, "GDX Airdrop #4"],
  ],
};

const config = {
  arbitrum: {
    factory: "0x32d1F0Dce675902f89D72251DB4AB1d728efa19c",
    fromBlock: 64404349,
  },
};

Object.keys(config).forEach((chain) => {
  const { factory, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: [
          "0xfe23981920c53fdfe858f29ee2c426fb8bf164162938c157cdf27bac46fccab7",
        ],
        eventAbi:
          "event GridCreated (address indexed token0, address indexed token1, int24 indexed resolution, address grid)",
        onlyArgs: true,
        fromBlock,
      });

      const ownerTokens = logs.map((i) => [[i.token0, i.token1], i.grid]);
      return sumTokens2({ api, ownerTokens });
    },
    staking: stakings(stakingContract, GDX),
  };
});

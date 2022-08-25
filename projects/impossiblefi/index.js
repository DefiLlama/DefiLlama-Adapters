const { staking } = require("../helper/staking");
const sdk = require("@defillama/sdk");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { uniTvlExport } = require("../helper/calculateUniTvl");

const stakingAddresses = [
  "0x1d37f1e6f0cce814f367d2765ebad5448e59b91b",
  "0x1aBd0067f60513F152ff14E9cD26a62c820d022C",
  "0xfc652ea2e8a373c16f3d8c5bd25e9898b9699ecb",
];
const idia = "0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89";

const ifUniTvlExport = (factoryAddress, chain) => {
  return (
    factoryAddress,
    chain,
    () => (addr) => `${chain}:${addr}`,
    {
      getReserves: {
        inputs: [],
        name: "getReserves",
        outputs: [
          { internalType: "uint256", name: "_reserve0", type: "uint256" },
          { internalType: "uint256", name: "_reserve1", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
    }
  );
};

module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([
      uniTvlExport(
        //factory
        "0x918d7e714243F7d9d463C37e106235dCde294ffC",
        "bsc"
      ),
      ifUniTvlExport("0x4233ad9b8b7c1ccf0818907908a7f0796a3df85f", "bsc"),
    ]),
    staking: sdk.util.sumChainTvls(
      stakingAddresses.map((a) => staking(a, idia, "bsc"))
    ),
  },
  kava: {
    tvl: sdk.util.sumChainTvls([
      ifUniTvlExport("0xE2da68886db83cb1b4A9878F1EfA6843f539df69", "kava"),
    ]),
  },
  boba: {
    tvl: sdk.util.sumChainTvls([
      ifUniTvlExport("0x7cF0a21D61Bb9215e44ACbA69442dE68ceb2C00D", "boba"),
    ]),
  },
  aurora: {
    tvl: sdk.util.sumChainTvls([
      ifUniTvlExport("0x45a3a315277Fbc1BCe0611c4398b32E0317Fd7c1", "aurora"),
    ]),
  },
  moonbeam: {
    tvl: sdk.util.sumChainTvls([
      ifUniTvlExport("0x45603612891b6406A06854813e18443fC8ec7C73", "moonbeam"),
    ]),
  },
  avax: {
    tvl: sdk.util.sumChainTvls([
      ifUniTvlExport("0x45603612891b6406A06854813e18443fC8ec7C73", "avax"),
    ]),
  },
};

const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("./helper/unwrapLPs");
const abi = require("./pendle/abi.json");
const { stakings } = require("./helper/staking.js");

async function pool2(timestamp, block, chainBlocks) {
  const balances = {};

  const masterChefDeposits = await sdk.api.abi.call({
    target: "0x73feaa1ee314f8c655e354234017be2193c9e24e",
    abi,
    params: [405, "0x9442dad1df11c858a900f55291dc1cf645ff66df"],
    block: chainBlocks.bsc,
    chain: "bsc",
  });

  await unwrapUniswapLPs(
    balances,
    [
      {
        balance: masterChefDeposits.output.amount,
        token: "0x8FA59693458289914dB0097F5F366d771B7a7C3F",
      },
    ],
    chainBlocks.bsc,
    "bsc",
    (a) => `bsc:${a}`
  );

  return balances;
}

module.exports = {
  bsc: {
    tvl: () => ({}),
    pool2,
    staking: stakings(
      [
        "0xdad49e63f97c967955975490a432de3796c699e6",
        "0xf8c1bA88F1E4aeD152F945F1Df2a8fdc36127B5f",
        "0x3bD6a582698ECCf6822dB08141818A1a8512c68D",
      ],
      "0x3203c9e46ca618c8c1ce5dc67e7e9d75f5da2377",
      "bsc"
    ),
  },
};

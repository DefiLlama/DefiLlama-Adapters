const { SDL, veSDL, veSDLStaking } = require("./index");


async function staking(timestamp, chainBlocks) {
  const balances = {};

  await staking(
    balances,
    [
      [SDL, false],
      [veSDL, false],
      [veSDLStaking, false],
    ],
    staking,
    chainBlocks["ethereum"],
    "ethereum"
  );

  return balances;
}
exports.evmTvl = evmTvl;

module.exports={
  methodology: "Staking TVL",
  ethereum:{
      tvl: eth_tvl,
  },
      tvl: sdk.util.sumChainTvls([eth_tvl, // SDL Staking TVL
          staking(veSDLStaking, veSDL, "ethereum", SDL),
      ]),
}

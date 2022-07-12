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

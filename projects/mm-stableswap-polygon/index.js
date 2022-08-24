const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const MM3BasePool = "0x690BBaa9EDBb762542FD198763092eaB2B2A5350";
const DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
const USDT = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [USDT, false],
      [USDC, false],
      [DAI, false]
    ],
    [MM3BasePool],
    chainBlocks["polygon"],
    "polygon",
    addr => `polygon:${addr}`
  );

  return balances;
};

module.exports = {
  doublecounted: true,
  polygon: {
    tvl
  },
  methodology: "Counts DAI, USDC, & USDT tokens on the 3MM Base Pool for tvl"
};

const { staking } = require("../helper/staking");
const { sumTokens2, nullAddress, } = require("../helper/unwrapLPs");

const tokens = {
  IBFR: "0xa296aD1C47FE6bDC133f39555C1D1177BD51fBc5",
  POOL: "0x7338ee5535F1E0f1a210a6Ef6dB34f5357EB9860",
  STAKING: "0xE6C2cDD466Eb1Fa6bDFDb8af1BD072d4A57734C2",
};

async function tvl(_timestamp, ethBlock, {bsc: block}) {
  return sumTokens2({ chain: 'bsc', block, tokens: [nullAddress], owner: tokens.POOL})
}

module.exports = {
  methodology: `TVL for Buffer is calculated by using the BNB deposited in the write pool and the iBFR deposited in the revenue share pool`,
  bsc: {
    staking: staking(tokens.STAKING, tokens.IBFR, 'bsc'),
    tvl,
  },
};

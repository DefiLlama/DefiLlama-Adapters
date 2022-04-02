const { pool2Exports } = require("../helper/pool2");
const { stakings } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const sdk = require("@defillama/sdk");

const spolar = "0x9D6fc90b25976E40adaD5A3EdD08af9ed7a21729";
const spolarrewardpool = "0xA5dF6D8D59A7fBDb8a11E23FDa9d11c4103dc49f";

const LPTokens = [
  "0x3fa4d0145a0b6Ad0584B1ad5f61cB490A04d8242", // POLAR-NEAR
  "0xADf9D0C77c70FCb1fDB868F54211288fCE9937DF", // SPOLAR-NEAR
  "0x3e50da46cB79d1f9F08445984f207278796CE2d2", // LUNAR-LUNA
];

const Tokens = [
  ["0xf0f3b9Eee32b1F490A4b8720cf6F005d4aE9eA86", false], // POLAR
];
const Sunrises = [
  "0xf3Cd8F422ffE23434C011f43F61879373b31a913", //lunar sunrise
  "0xA452f676F109d34665877B7a7B203f2B445D7DE0", //polar sunrise
];

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  let stakingsTvl = await stakings(Sunrises, spolar, "aurora")(
    timestamp,
    block,
    chainBlocks
  );

  sdk.util.sumSingleBalance(
    balances,
    `aurora:${spolar}`,
    stakingsTvl[`aurora:${spolar}`]
  );

  let poolTvl = await pool2Exports(spolarrewardpool, LPTokens, "aurora")(
    timestamp,
    block,
    chainBlocks
  );
  for (let i in poolTvl) {
    sdk.util.sumSingleBalance(balances, i, poolTvl[i]);
  }
  await sumTokensAndLPsSharedOwners(
    balances,
    Tokens,
    [spolarrewardpool],
    block,
    "aurora",
    (addr) => `aurora:${addr}`
  );
  return balances;
}

async function pool2(timestamp, block, chainBlocks) {
  let balances = {};
  let poolTvl = await pool2Exports(spolarrewardpool, LPTokens, "aurora")(
    timestamp,
    block,
    chainBlocks
  );
  for (let i in poolTvl) {
    sdk.util.sumSingleBalance(balances, i, poolTvl[i]);
  }
  await sumTokensAndLPsSharedOwners(
    balances,
    Tokens,
    [spolarrewardpool],
    block,
    "aurora",
    (addr) => `aurora:${addr}`
  );
  return balances;
}
module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Pool2 TVL accounts for all LPs staked in Dawn, Staking TVL accounts for all tokens staked in Sunrise.",
  aurora: {
    tvl,
    pool2,
    staking: stakings(Sunrises, spolar, "aurora"),
  },
};

const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const treasury = "0xb20234c33337537111f4ab6f5EcaD400134aC143";
const WCRO = "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23";

const croblancAlpha = "0x52a87ef19e4a0E8cc70aE69D22bc8254bc6fa0F9";

const pool2Farm = "0x4c1EC4Bf75CdFAF9b172e94cc85b7a8eA647F267";
const WCRO_CROBLANC_CronaLP = ["0xac23a7de083719c0e11d5c2efbcc99db5c73bb48"];

const cronosTvl = async (chainBlocks) => {
  const balances = {};

  const farms = (
    await sdk.api.abi.call({
      abi: abi.getFarms,
      target: croblancAlpha,
      chain: "cronos",
      block: chainBlocks["cronos"],
    })
  ).output;

  const lpPositions = [];
  for (const farm of farms) {
    const want = (
      await sdk.api.abi.call({
        abi: abi.want,
        target: farm,
        chain: "cronos",
        block: chainBlocks["cronos"],
      })
    ).output;

    const wantBalance = (
      await sdk.api.abi.call({
        abi: abi.stakedWant,
        target: farm,
        chain: "cronos",
        block: chainBlocks["cronos"],
      })
    ).output;

    if (
      WCRO_CROBLANC_CronaLP.some(
        (addr) => addr.toLowerCase() === want.toLowerCase()
      )
    ) {
    } else {
      lpPositions.push({
        token: want,
        balance: wantBalance,
      });
    }
  }

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["cronos"],
    "cronos",
    (addr) => `cronos:${addr}`
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  cronos: {
    treasury: staking(treasury, WCRO, "cronos"),
    pool2: pool2(pool2Farm, WCRO_CROBLANC_CronaLP[0], "cronos"),
    tvl: cronosTvl,
  },
  methodology:
    "Counts liquidity on all the Farms through CroblancAlpha Contract",
};

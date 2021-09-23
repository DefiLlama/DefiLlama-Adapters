const sdk = require("@defillama/sdk");
const { transformBscAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const abi = require("./abi.json");

const CONTROLLER = "0xbB7D94a423f4978545ecf73161f0678e8AfD1a92";
const CONTROLLER_BSC = "0xC11c339a1B24b3a10f81a309A1d271DE141908dA";

const kETH = "0xa58e822De1517aAE7114714fB354Ee853Cd35780";
const kETH_BSC = "0x670076F14fb7Bc9735Af1BC9a1D1ad5266f54FA0";

const ETH = "0x0000000000000000000000000000000000000000";

const kxKINE = "0x473ccDeC83B7125a4F52Aa6F8699026FCB878eE8";
const KINE = "0xCbfef8fdd706cde6F208460f2Bf39Aa9c785F05D";

/* ---- Farm at ethereum chain ---- */
const KINE_ETH_LP_FARM = "0x80850DB68db03792CA5650fbdacCeBe1DA5e52bF";
const kUSD_ETH_LP_FARM = "0x834C3bB26bb1Bf025dc6B66aD5D7F9003333606b";
const kUSD_USDT_LP_FARM = "0xc75ba7E3A40E2293817b590e47BEb01e52A0C9b6";

/* ---- Farm at bsc chain ---- */
const KINE_kUSD_LP_FARM = "0x6c2C7C5b5c0B60a13B981ACCFe1aa1616985d3D7";
const BUSD_T_kUSD_LP_FARM = "0x308043A2a7c62B17906F9B074a349c43ccD919ad";

const calcTvl = async (balances, chain, block, controller, arrFarms) => {
  const KERC20_TOKENS = (
    await sdk.api.abi.call({
      abi: abi.getAllMarkets,
      target: controller,
      block,
      ...(chain == "bsc" && { chain }),
    })
  ).output;

  if (KERC20_TOKENS.length != 0) {
    const underlyingTokens = (
      await sdk.api.abi.multiCall({
        abi: abi.underlying,
        calls: KERC20_TOKENS.map((underAddr) => ({
          target: underAddr,
        })),
        block,
        ...(chain == "bsc" && { chain }),
      })
    ).output.map((addr) => addr.output);

    const getCash = (
      await sdk.api.abi.multiCall({
        abi: abi.getCash,
        calls: KERC20_TOKENS.map((Addr) => ({
          target: Addr,
        })),
        block,
        ...(chain == "bsc" && { chain }),
      })
    ).output.map((bal) => bal.output);

    for (let i = 0; i < KERC20_TOKENS.length; i++) {
      try {
        sdk.util.sumSingleBalance(
          balances,
          `${underlyingTokens[i]}`,
          getCash[i]
        );
      } catch (err) {
        console.error(err);
      }
    }

    let getCashkETH = (
      await sdk.api.eth.getBalance({
        target: kETH,
        block,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, ETH, getCashkETH);

    const getCashkxKINE = (
      await sdk.api.abi.call({
        abi: abi.getCash,
        target: kxKINE,
        block,
        ...(chain == "bsc" && { chain }),
      })
    ).output;

    sdk.util.sumSingleBalance(balances, KINE, getCashkxKINE);
  }

  const farmStakingTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.stakingToken,
      calls: arrFarms.map((stakingAddr) => ({
        target: stakingAddr,
      })),
      block,
      ...(chain == "bsc" && { chain }),
    })
  ).output.map((el) => el.output);

  const stakedAmts = (
    await sdk.api.abi.multiCall({
      abi: abi.totalStakes,
      calls: arrFarms.map((stakingAddr) => ({
        target: stakingAddr,
      })),
      block,
      ...(chain == "bsc" && { chain }),
    })
  ).output.map((el) => el.output);

  const lpPositions = stakedAmts.map((amt, idx) => ({
    token: farmStakingTokens[idx],
    balance: amt,
  }));

  if (chain == "bsc") {
    const transformAdress = await transformBscAddress();

    await unwrapUniswapLPs(
      balances,
      lpPositions,
      block,
      "bsc",
      transformAdress
    );
  } else {
    await unwrapUniswapLPs(balances, lpPositions, block);
  }
};

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const arrFarms = [KINE_ETH_LP_FARM, kUSD_ETH_LP_FARM, kUSD_USDT_LP_FARM];

  await calcTvl(balances, "", ethBlock, CONTROLLER, arrFarms);

  return balances;
};

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const arrFarms = [KINE_kUSD_LP_FARM, BUSD_T_kUSD_LP_FARM];

  await calcTvl(balances, "bsc", chainBlocks["bsc"], CONTROLLER_BSC, arrFarms);

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl, bscTvl]),
};

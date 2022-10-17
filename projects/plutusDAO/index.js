const sdk = require("@defillama/sdk");
const { staking, stakings } = require("../helper/staking");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { abis } = require("./abis");
const { transformArbitrumAddress } = require("../helper/portedTokens");

const CHAIN = "arbitrum";

const plutusToken = "0x51318B7D00db7ACc4026C88c3952B66278B6A67F";

async function tvl(ts, _block, chainBlocks) {
  const transformAddr = await transformArbitrumAddress();
  const customTransformAddress = (address) => {
    const a = address.toLowerCase();

    if (a === "0xf236ea74b515ef96a9898f5a4ed4aa591f253ce1") {
      return "dopex";
    }
    return transformAddr(address);
  };

  const glpPrice = await calculateGLPPrice(chainBlocks.arbitrum);

  const singleStakingFarmOps = sumSingleStakingFarms();

  const lpFarmsOps = sumPlutusLPFarms(customTransformAddress);

  const balances = await sdk.util.sumChainTvls([
    ...singleStakingFarmOps,
    lpFarmsOps,
    calculateStaking,
  ])(ts, _block, chainBlocks);

  balances["jones-dao"] = balances["jones-dao"] / 1e16;
  balances["dopex"] = balances["dopex"] / 1e18;
  balances["sperax"] = balances["sperax"] / 1e18;
  // GLP does not have coingecko support, will use USDC price * GLP price
  // get from calculateGLPPrice method
  balances["usd-coin"] = (balances["usd-coin"] * glpPrice) / 1e18;

  return balances;
}

// Follow their official Github to calculate GLP price
// https://github.com/gmx-io/gmx-stats/blob/99139b377d7fc6e8be6f31a9da6d3513e0f1172d/src/dataProvider.js#L109
const calculateGLPPrice = async (block) => {
  const glpControllerAddr = `0x321F653eED006AD1C29D174e17d96351BDe22649`;
  const fGlpFarm = `0x4e971a87900b931fF39d1Aad67697F49835400b6`;

  const { output: glpAum } = await sdk.api.abi.call({
    target: glpControllerAddr,
    params: true,
    abi: abis.getAums,
    chain: "arbitrum",
    block,
  });

  const { output: glpTotalSupply } = await sdk.api.abi.call({
    target: fGlpFarm,
    abi: "erc20:totalSupply",
    chain: "arbitrum",
    block,
  });

  const glpPrice = glpAum / 1e18 / (glpTotalSupply / 1e18);

  return glpPrice;
};

const sumSingleStakingFarms = () => {
  // plsDPX single staking farm
  const plsDpx = "0xF236ea74B515eF96a9898F5a4ed4Aa591f253Ce1";

  const plsDpxFarm = "0x75c143460F6E3e22F439dFf947E25C9CcB72d2e8";
  const plsDpxTvl = staking(plsDpxFarm, plsDpx, "arbitrum", "dopex");

  // plsJones single staking farm
  const plsJones = "0xe7f6C3c1F0018E4C08aCC52965e5cbfF99e34A44";

  const plsJonesFarm = "0x23B87748b615096d1A0F48870daee203A720723D";

  const jones = staking(plsJonesFarm, plsJones, "arbitrum", `jones-dao`);

  // plsSpa single staking farm
  const plsSpa = "0x0D111e482146fE9aC9cA3A65D92E65610BBC1Ba6";

  const plsSpaFarm = "0x73e7c78E8a85C074733920f185d1c78163b555C8";

  const spa = staking(plsSpaFarm, plsSpa, "arbitrum", "sperax");

  //plsDpx v1 (deprecated)

  const plsDpxFarmV1 = "0x20DF4953BA19c74B2A46B6873803F28Bf640c1B5";
  const plsDpxV1Tvl = staking(plsDpxFarmV1, plsDpx, "arbitrum", "dopex");

  // plvGLP farms
  const plvGlpToken = "0x5326E71Ff593Ecc2CF7AcaE5Fe57582D6e74CFF1";
  const plgGlpPlutusChef = "0x4E5Cf54FdE5E1237e80E87fcbA555d829e1307CE";
  const plvGLP = staking(plgGlpPlutusChef, plvGlpToken, "arbitrum", "usd-coin");

  return [plsDpxTvl, jones, spa, plsDpxV1Tvl, plvGLP];
};

const calculateStaking = async (ts, _block, chainBlocks) => {
  const plutusStakingContracts = [
    "0x27Aaa9D562237BF8E024F9b21DE177e20ae50c05",
    "0xE59DADf5F7a9decB8337402Ccdf06abE5c0B2B3E",
    "0xBEB981021ed9c85AA51d96C0c2edA10ee4404A2e",
  ];

  const balances = await stakings(
    plutusStakingContracts,
    plutusToken,
    CHAIN,
    "plutusdao"
  )(ts, _block, chainBlocks);

  balances["plutusdao"] = balances["plutusdao"] / 1e18;
  return balances;
};

const sumPlutusLPFarms = (transformAddr) => {
  return async (ts, block, chainBlocks) => {
    const balances = {};
    try {
      // dpx-plsDPX farm
      const dpxPlsDpxMasterChef = "0xA61f0d1d831BA4Be2ae253c13ff906d9463299c2";
      const dpxPlsDpxLp = "0x16e818e279d7a12ff897e257b397172dcaab323b";

      //pls-eth LP farm

      const plsEthMasterChef = "0x5593473e318F0314Eb2518239c474e183c4cBED5";
      const plsEthLp = "0x6CC0D643C7b8709F468f58F363d73Af6e4971515";

      const lpFarms = [
        {
          token: dpxPlsDpxLp,
          masterchef: dpxPlsDpxMasterChef,
        },
        { token: plsEthLp, masterchef: plsEthMasterChef },
      ];

      const lpBalances = (
        await sdk.api.abi.multiCall({
          calls: lpFarms.map((p) => ({
            target: p.token,
            params: p.masterchef,
          })),
          abi: "erc20:balanceOf",
          block: chainBlocks.arbitrum,
          chain: "arbitrum",
        })
      ).output;

      let lpPositions = lpBalances.map((p) => {
        return {
          balance: p.output,
          token: p.input.target,
        };
      });

      await unwrapUniswapLPs(
        balances,
        lpPositions,
        chainBlocks.arbitrum,
        CHAIN,
        transformAddr
      );

      return balances;
    } catch (error) {
      return balances;
    }
  };
};

module.exports = {
  misrepresentedTokens: true,
  [CHAIN]: {
    tvl,
    staking: calculateStaking,
  },
};

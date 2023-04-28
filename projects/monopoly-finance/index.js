const { default: axios } = require("axios");
const { staking } = require("../helper/staking");
const abi = require("./abi.json");
const chef = "0x72E4CcEe48fB8FEf18D99aF2965Ce6d06D55C8ba";
const duo = "0x322F15d4BEDaa20C178fb75b2628663D2dA19736".toLowerCase();
const ACC_DUO_PRECISION = 1e18;

const zyberGammaLps = [
  "0x0adf0161bd2f174d94beadf8dc47f3af9b408627",
  "0x282aa43579d2520545f0d927884e79226e269c07",
  "0x2e8c115011098cae93dbf8b9662845fa92cc0730",
  "0x35ea99ab62bcf7992136558e94fb97c7807fcd6a",
  "0x3b3fec6029534e4e794f0cfb58cc64cdd66b90c7",
  "0x589369676ed7cee7b6455cadcc951b02b6d10b9b",
  "0x5d9648ba8dc63cdbdc1f3101178c5daa9408ed0e",
  "0x86cd7fd91f2cfcf264396a4556c139379a5fbc5a",
  "0x8ffac5723b0288e80f6fea715dbd98e360b11d6f",
  "0x95177b49208fd176724a0058f357c1b69149affd",
  "0xa634bb5eb81b3ec6041c68fc77dff2068df33cb4",
  "0xaa3522d51448a33682692baccfbefc109d211f65",
  "0xb5c335cfaf1769ee02597c6ac2db883f793a020d",
  "0xc2be9df80ce62e4258c27b1ffef741adc118b8b0",
  "0xd06e6a71121bfd6c1079bd0b4b231a92022953c9",
  "0xd53eb268f6f717608c552c470ddc37bb59194593",
  "0xd820502864dc8928b40b92e764908a22780a0ffe",
  "0xde9b90e239de55baa063ab9fca5e82fb5a8d4042",
  "0xea17b00b9fc3ecaf1cb24cc1d5c594146c68a4bc",
];
async function getTokensInMasterChef(time, ethBlock, chainBlocks, { api }) {
  const poolInfo = await api.fetchList({
    lengthAbi: abi.poolLength,
    itemAbi: abi.poolInfo,
    target: chef,
  });

  const [gammaLpTotalSupply, gammaToken0, gammaToken1, gammaLpReserves] =
    await Promise.all([
      api.multiCall({ calls: zyberGammaLps, abi: abi.totalSupply }),
      api.multiCall({ calls: zyberGammaLps, abi: abi.token0 }),
      api.multiCall({ calls: zyberGammaLps, abi: abi.token1 }),
      api.multiCall({ calls: zyberGammaLps, abi: abi.getTotalAmounts }),
    ]);

  const tokens = [...gammaToken0, ...gammaToken1]
    .flat()
    .map((i) => i.toLowerCase());
  const tokensDecimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: tokens,
  });

  const gammaLpData = zyberGammaLps.map((lp, i) => {
    const supply = gammaLpTotalSupply[i] / 1e18;
    const token0 = gammaToken0[i].toLowerCase();
    const token1 = gammaToken1[i].toLowerCase();
    const token0Decimals = tokensDecimals[tokens.indexOf(token0)];
    const token1Decimals = tokensDecimals[tokens.indexOf(token1)];

    return {
      lp,
      lpPerToken0:
        gammaLpReserves[i].totalAmount0 / (supply * 10 ** token0Decimals),
      lpPerToken1:
        gammaLpReserves[i].totalAmount1 / (supply * 10 ** token1Decimals),
      token0,
      token1,
      token0Decimals,
      token1Decimals,
    };
  });

  poolInfo.forEach((pool) => {
    let { lpToken, totalShares, lpPerShare } = pool;
    lpToken = lpToken.toLowerCase();
    if (lpToken === duo) {
      return;
    }
    let bals = (totalShares * lpPerShare) / ACC_DUO_PRECISION;
    if (zyberGammaLps.includes(lpToken)) {
      const {
        token0,
        token1,
        token0Decimals,
        token1Decimals,
        lpPerToken0,
        lpPerToken1,
      } = gammaLpData.find((i) => i.lp === lpToken);
      api.add(token0, (bals * lpPerToken0) / 10 ** (18 - token0Decimals));
      api.add(token1, (bals * lpPerToken1) / 10 ** (18 - token1Decimals));
    } else {
      api.add(lpToken, bals);
    }
  });
}
module.exports = {
  methodology:
    "TVL includes all farms in MasterChef contract, as well as staking pools.",
  arbitrum: {
    tvl: getTokensInMasterChef,
    staking: staking("0x338f4D8E982de9518d84A40ceD1DD845862A727e", duo),
  },
};

const { getChainTransform} = require("../helper/portedTokens")
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");


const DAI = "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70"
const USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
const USDT = "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"


const collateralAddr = [
    "0xD5a7Df8B56d285011AbE406235109c029F45797A", // 3pool
  ];

async function stablePoolTvl(timestamp, chainBlocks) {
    const balances = {};
    const transformAddress = await getChainTransform("avax");
    await sumTokensAndLPsSharedOwners(
        balances,
        [
          [DAI, false],
          [USDC, false],
          [USDT, false],
        ],
        collateralAddr,
        chainBlocks["avax"],
        "avax",
        transformAddress
    );
    return balances;
  }

module.exports = {
    methodology: 'Counts the DAI, USDC, and USDT that have been deposited to mint CHAOS',
    avax: {
        tvl: stablePoolTvl
    }
};
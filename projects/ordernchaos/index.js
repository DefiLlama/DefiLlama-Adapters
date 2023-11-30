const ADDRESSES = require('../helper/coreAssets.json')
const { getChainTransform} = require("../helper/portedTokens")
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");


const DAI = ADDRESSES.avax.DAI
const USDC = ADDRESSES.avax.USDC
const USDT = ADDRESSES.avax.USDt


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
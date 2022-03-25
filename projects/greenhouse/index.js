const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformPolygonAddress } = require("../helper/portedTokens");

const MASTERCHEF_CONTRACT = "0xbD40a260Ddd78287ddA4C4ede5880505a9fEdF9a";

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: MASTERCHEF_CONTRACT,
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLength; index++) {
    const token = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: MASTERCHEF_CONTRACT,
        params: index,
        chain: "polygon",
        block: chainBlocks["polygon"],
      })
    ).output[0];
    if(token === "0x40DB6d7812b8288eCA452F912ca9F262b186f278" || token === "0x388E2a3d389F27504212030c2D42Abf0a8188cd1"){ // GREEN and stkGHOST-ETH
      continue;
    }

    const token_bal = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: token,
        params: MASTERCHEF_CONTRACT,
        chain: "polygon",
        block: chainBlocks["polygon"],
      })
    ).output;

    lpPositions.push({
      token,
      balance: token_bal,
    });
  }

  const transformAddress = await transformPolygonAddress()

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  // polygon GREEN
  balances['polygon:0x40DB6d7812b8288eCA452F912ca9F262b186f278']

  return balances;
};

module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
};

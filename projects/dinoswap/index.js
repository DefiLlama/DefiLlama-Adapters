const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformPolygonAddress } = require("../helper/portedTokens");

const MASTERCHEF_CONTRACT = "0x1948abC5400Aa1d72223882958Da3bec643fb4E5";

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
    if(token === "0xAa9654BECca45B5BDFA5ac646c939C62b527D394" || token === "0x388E2a3d389F27504212030c2D42Abf0a8188cd1"){ // DINO and stkGHOST-ETH
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

  // eth dino to polygon dino
  balances['polygon:0xAa9654BECca45B5BDFA5ac646c939C62b527D394'] = balances['0x2701e1d67219a49f5691c92468fe8d8adc03e609']
  delete balances['0x2701e1d67219a49f5691c92468fe8d8adc03e609']

  return balances;
};

module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl]),
};

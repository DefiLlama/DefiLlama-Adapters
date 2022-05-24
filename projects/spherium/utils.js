const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { transformBscAddress, transformPolygonAddress } = require("../helper/portedTokens");
const { BRIDGE_ADDRESS } = require("./constants");

const callMethod = async (method, chain, chainBlocks, params = []) => {
  return (
    await sdk.api.abi.call({
      abi: abi[method],
      chain,
      target: BRIDGE_ADDRESS,
      params,
      block: chainBlocks[chain],
    })
  ).output;
};

const getTokenNames = async (chain, chainBlocks) => {
  return await callMethod("getAllWhitelistedTokenNames", chain, chainBlocks);
};

const getTokenAddress = async (chain, chainBlocks, tokenName) => {
  return await callMethod("whitelistedTokenAddress", chain, chainBlocks, [
    tokenName,
  ]);
};

const getTokenAmount = async (chain, chainBlocks, tokenAddress) => {
  return (
    await sdk.api.abi.call({
      abi: "erc20:balanceOf",
      chain,
      target: tokenAddress,
      params: [BRIDGE_ADDRESS],
      block: chainBlocks[chain],
    })
  ).output;
};

module.exports = { getTokenNames, getTokenAddress, getTokenAmount };

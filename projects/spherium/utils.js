const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const BRIDGE_ADDRESS = "0x0b8c93c6aaeabfdf7845786188727aa04100cb61";

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
  return await callMethod("getTokensLocked", chain, chainBlocks, [
    tokenAddress,
  ]);
};

module.exports = { getTokenNames, getTokenAddress, getTokenAmount };

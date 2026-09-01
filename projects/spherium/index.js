const abi = {
  "getAllWhitelistedTokenNames": "string[]:getAllWhitelistedTokenNames",
  "whitelistedTokenAddress": "function whitelistedTokenAddress(string) view returns (address)"
}
const bridgeAddr = "0x0b8c93c6aaeabfdf7845786188727aa04100cb61";
const supportedChains = [
  "ethereum",
  "bsc",
  "polygon",
  "avax",
  "fantom",
  "arbitrum",
  "cronos",
  "moonriver",
  "moonbeam",
  "optimism",
  "aurora",
  "okexchain",
  "kcc",
];

const blackList = new Set(["SPHRI"]);

const tvl = async (api) => {
  let tokenNames = await api.call({ target: bridgeAddr, abi: abi.getAllWhitelistedTokenNames, })
  tokenNames = tokenNames.filter(i => !blackList.has(i))
  const tokens = await api.multiCall({ target: bridgeAddr, abi: abi.whitelistedTokenAddress, calls: tokenNames })
  return api.sumTokens({ owner: bridgeAddr, tokens, })
};

supportedChains.forEach((chain) => {
  module.exports[chain] = { tvl };
});
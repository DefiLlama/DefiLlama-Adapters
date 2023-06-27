// Equity Spot - Central Vaults

const sdk = require("@defillama/sdk")
const { sumTokens } = require('../helper/unwrapLPs')

const fantomVault_01 = "0x9e4105f9e2284532474f69e65680e440f4c91cb8";
const chain= 'fantom'

const fantomTVL = async (timestamp, _block, { [chain]: block}) => {
  const calls = []
  const { output: size } = await sdk.api.abi.call({
    target: fantomVault_01,
    abi: "uint256:allWhitelistedTokensLength",
    chain, block,
  })
  for (let i = 0;i < +size; i++)
    calls.push({params: i})
  const { output: tokens } = await sdk.api.abi.multiCall({
    target: fantomVault_01,
    abi: "function allWhitelistedTokens(uint256) view returns (address)",
    calls,
    chain, block,
  })
  const toa = tokens.map(i => [i.output, fantomVault_01])
  return sumTokens({}, toa, block, chain)
};

module.exports = {
  fantom: {
    tvl: fantomTVL,
  },
};

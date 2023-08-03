const sdk = require("@defillama/sdk");
const chain = "arbitrum";

const balanceABI = 'function balance(bool isMax) view returns (uint256)';

const getGlpPriceABI = "uint256:getGlpPrice";

const usdcVaults = [
  "0x9ba57a1D3f6C61Ff500f598F16b97007EB02E346",
  "0x5D8a5599D781CC50A234D73ac94F4da62c001D8B",
  "0xE40bEb54BA00838aBE076f6448b27528Dd45E4F0",
  "0x1704A75bc723A018D176Dc603b0D1a361040dF16",
];

const glpVaults = [
  "0xbFbEe90E2A96614ACe83139F41Fa16a2079e8408",
  "0x0FAE768Ef2191fDfCb2c698f691C49035A53eF0f",
  "0x2b8E28667A29A5Ab698b82e121F2b9Edd9271e93",
  "0x46d6dEE922f1d2C6421895Ba182120C784d986d3",
];

async function usdcVaultsTVL(block) {
  const { output: tvls } = await sdk.api.abi.multiCall({
    abi: balanceABI,
    calls: usdcVaults.map((i) => ({ target: i, params: true })),
    chain,
    block,
  });

  let tvl = 0;
  tvls.forEach((i) => (tvl += i.output / 1e6));
  return tvl;
}

async function glpVaultsTVL(block) {
  const { output: glpPrice } = await sdk.api.abi.call({
    abi: getGlpPriceABI,
    target: glpVaults[0],
    chain,
    block,
  });

  const { output: tvls } = await sdk.api.abi.multiCall({
    abi: balanceABI,
    calls: glpVaults.map((i) => ({ target: i, params: true })),
    chain,
    block,
  });

  let tvl = 0;
  tvls.forEach((i) => (tvl += i.output / 1e18));
  return (tvl * glpPrice) / 1e18;
}

async function tvl(ts, _, { [chain]: block }) {
  const totalTvl = (await usdcVaultsTVL(block)) + (await glpVaultsTVL(block));

  return {
    "usd-coin": totalTvl,
  };
}

module.exports = {
  arbitrum: {
    tvl,
  },
  misrepresentedTokens: true,
};

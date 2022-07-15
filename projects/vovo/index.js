const sdk = require("@defillama/sdk");

const usdcVaultAbi = require("../helper/abis/vovoUsdc.json");
const glpVaultAbi = require("../helper/abis/vovoGlp.json");

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

async function usdcVaultsTVL(chainBlocks) {
  const tvls = await Promise.all(
    usdcVaults.map(async (vaultAddress) => {
      const { output: tvl } = await sdk.api.abi.call({
        abi: usdcVaultAbi.totalSupply,
        chain: "arbitrum",
        target: vaultAddress,
        block: chainBlocks.arbitrum,
      });

      return +tvl / 1e6;
    })
  );

  const totalTvl = tvls.reduce((prev, current) => current + prev, 0);
  return totalTvl;
}

async function glpVaultsTVL(chainBlocks) {
  const { output: glpPrice } = await sdk.api.abi.call({
    abi: glpVaultAbi.getGlpPrice,
    chain: "arbitrum",
    target: glpVaults[0],
    block: chainBlocks.arbitrum,
  });

  const tvls = await Promise.all(
    glpVaults.map(async (vaultAddress) => {
      const { output: tvl } = await sdk.api.abi.call({
        abi: glpVaultAbi.totalSupply,
        chain: "arbitrum",
        target: vaultAddress,
        block: chainBlocks.arbitrum,
      });

      return +tvl / 1e18;
    })
  );

  const totalTvl = tvls.reduce((prev, current) => current + prev, 0);
  return totalTvl * (+glpPrice / 1e18);
}

async function tvl(timestamp, block, chainBlocks) {
  const totalTvl =
    (await usdcVaultsTVL(chainBlocks)) + (await glpVaultsTVL(chainBlocks));

  return totalTvl;
}

module.exports = {
  arbitrum: {
    tvl,
  },
};

const ADDRESSES = require('../helper/coreAssets.json')
const balanceABI = 'function balance(bool isMax) view returns (uint256)';

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

async function tvl(api) {
  const vaults = usdcVaults.concat(glpVaults);
  const tvls = await api.multiCall({
    abi: balanceABI,
    calls: vaults.map((i) => ({ target: i, params: true })),
  });
  const tokens  = (await api.multiCall({  abi: 'address:vaultToken', calls: vaults, permitFailure: true, })).map(i => i ?? ADDRESSES.arbitrum.fsGLP)
  api.add(tokens, tvls)
}

module.exports = {
  arbitrum: {
    tvl,
  },
  misrepresentedTokens: true,
};

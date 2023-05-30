const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const contracts = require("./contracts.json");

const POOL_REGISTRY_BYTES =
  "0x506f6f6c52656769737472790000000000000000000000000000000000000000";
module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Counts as TVL all the Assets deposited on each chain through different Pool Contracts",

  hallmarks: [[1651276800, "sUSDv2 hack"]],
};

async function getPoolDataAtIndex(index, poolReg, block, chain) {
  const res = await sdk.api.abi.call({
    abi: `function getPoolDataAtIndex(uint256 index) view returns (tuple(
      address poolAddress,
      address lpToken,
      uint8 typeOfAsset,
      bytes32 poolName,
      address targetAddress,
      address[] tokens,
      address[] underlyingTokens,
      address basePoolAddress,
      address metaSwapDepositAddress,
      bool isSaddleApproved,
      bool isRemoved,
      bool isGuarded
      ))`,
    target: poolReg,
    block: block,
    params: [index],
    chain: chain,
  });
  return res.output;
}

async function getPoolsData(poolReg, block, chain) {
  const poolLength = await sdk.api.abi.call({
    abi: "uint256:getPoolsLength",
    target: poolReg,
    chain: chain,
    block: block,
  });
  const poolDatas = [];
  for (var i = 0; i < poolLength.output; i++) {
    const poolData = await getPoolDataAtIndex(i, poolReg, block, chain);
    poolDatas.push({
      poolAddress: poolData.poolAddress,
      lpToken: poolData.lpToken,
      tokens: poolData.tokens,
    });
  }
  return poolDatas;
}

async function getPoolReg(block, chain) {
  const poolRegAddress = await sdk.api.abi.call({
    abi: "function resolveNameToLatestAddress(bytes32 name) view returns (address)",
    target: contracts[chain],
    params: [POOL_REGISTRY_BYTES],
    block: block,
    chain: chain,
  });
  return poolRegAddress.output;
}

Object.keys(contracts).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const poolsDatas = await getPoolsData(await getPoolReg(block, chain), block, chain);
      const toa = [];
      const blacklistedTokens = [];
      Object.values(poolsDatas).forEach(({ poolAddress, lpToken, tokens }) => {
        blacklistedTokens.push(lpToken);
        tokens.forEach((i) => toa.push([i, poolAddress]));
      });
      const balances = await sumTokens2({
        tokensAndOwners: toa,
        chain,
        block,
        blacklistedTokens,
      });
      return balances;
    },
  };
});

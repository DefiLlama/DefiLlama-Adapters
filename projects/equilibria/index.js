const sdk = require("@defillama/sdk");
const { sumTokensExport } = require("../helper/unwrapLPs");

const contracts = {
  ethereum: {
    boosterAddress: "0x4D32C8Ff2fACC771eC7Efc70d6A8468bC30C26bF",
    staker: "0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3",
    eqbAddress: "0xfE80D611c6403f70e5B1b9B722D2B3510B740B2B",
    eqbRewardsAddress: "0xd8967B2B15b3CDF96039b7407813B4037f73ec27",
    pendleAddress: "0x808507121b80c02388fad14726482e061b8da827",
  },
  arbitrum: {
    boosterAddress: "0x4D32C8Ff2fACC771eC7Efc70d6A8468bC30C26bF",
    staker: "0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3",
    eqbRewardsAddress: "0x70f61901658aAFB7aE57dA0C30695cE4417e72b9",
    pendleAddress: "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8",
  },
};

async function tvl(chain, block) {
  const balances = {};

  if (chain === "ethereum") {
    const pendleLocked = await sdk.api2.abi.call({
      target: "0x4f30A9D41B80ecC5B94306AB4364951AE3170210",
      params: contracts[chain].staker,
      abi: "erc20:balanceOf",
      block,
    });
    sdk.util.sumSingleBalance(
      balances,
      contracts[chain].pendleAddress,
      pendleLocked
    );
  }

  const poolLength = await sdk.api2.abi.call({
    chain,
    block,
    target: contracts[chain].boosterAddress,
    abi: "function poolLength() view returns (uint256)",
  });

  const poolInfos = await Promise.all(
    Array.from(Array(Number(poolLength)).keys()).map((params) =>
      sdk.api2.abi.call({
        chain,
        block,
        target: contracts[chain].boosterAddress,
        params,
        abi: "function poolInfo(uint256) view returns (address market, address token, address rewardPool, bool shutdown)",
      })
    )
  ); // multicall fails here

  const { output: gaugeBalances } = await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    calls: Array.from(new Set(poolInfos.map((p) => p.market))).map((i) => ({
      target: i,
      params: contracts[chain].staker,
    })),
    chain,
    block,
  });

  gaugeBalances.forEach(({ output, input }, i) =>
    sdk.util.sumSingleBalance(
      balances,
      chain +
        ":" +
        poolInfos.find(
          (p) => p.market.toLowerCase() === input.target.toLowerCase()
        ).market,
      output
    )
  );

  return balances;
}

const chains = ["ethereum", "arbitrum"];

module.exports = {
  doublecounted: true,
};

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => tvl(chain, block),
  };
});

module.exports.ethereum.staking = sumTokensExport({
  owner: contracts.ethereum.eqbRewardsAddress,
  tokens: [contracts.ethereum.eqbAddress],
});

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
  bsc: {
    boosterAddress: "0x4D32C8Ff2fACC771eC7Efc70d6A8468bC30C26bF",
    staker: "0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3",
    eqbRewardsAddress: "0x0140dE476f49B6B42f7b73612b6dc317aB91D3BC",
    pendleAddress: "0xb3Ed0A426155B79B898849803E3B36552f7ED507",
  },
  optimism: {
    boosterAddress: "0x18C61629E6CBAdB85c29ba7993f251b3EbE2B356",
    staker: "0x4D32C8Ff2fACC771eC7Efc70d6A8468bC30C26bF",
    eqbRewardsAddress: "0x22Fc5A29bd3d6CCe19a06f844019fd506fCe4455",
    pendleAddress: "0xBC7B1Ff1c6989f006a1185318eD4E7b5796e66E1",
  },
  mantle: {
    boosterAddress: "0x920873E5b302A619C54c908aDFB77a1C4256A3B8",
    staker: "0x479603DE0a8B6D2f4D4eaA1058Eea0d7Ac9E218d",
    eqbRewardsAddress: "0x71e0ce200a10f0bBFB9F924fE466ACf0B7401EbF",
    pendleAddress: "0xd27B18915e7acc8FD6Ac75DB6766a80f8D2f5729",
  }
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

const chains = ["ethereum", "arbitrum", 'bsc', 'optimism', 'mantle'];

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

const axios = require("axios");
const BigNumber = require("bignumber.js");
const ethers = require("ethers");
const ERC20 = require("./ERC20.json");
const { gql, request } = require("graphql-request");

const subgraph_url =
  "https://api.thegraph.com/subgraphs/name/pinedefi/open-loans";

const GQL_POOLS = gql`
  query pools {
    pools(first: 1000) {
      id
      totalUtilization
      collection
      supportedCurrency
      target
      fundSource
      duration
      interestBPS1000000XBlock
      collateralFactorBPS
      lenderAddress
    }
  }
`;

const provider = new ethers.providers.JsonRpcProvider(
  "https://eth-mainnet.g.alchemy.com/v2/UN5z0qze-a7hJuNOqFMUs9t2blMsxcN7"
);

const tvl = async () => {
  const { data: pools } = await axios.get(
    "http://localhost:8080/v0/pools/addresses?ethereum=1"
  );

  const { pools: subgraphPools } = await request(subgraph_url, GQL_POOLS);

  let tvl = new BigNumber(0);

  await Promise.all(
    pools.map(async (pool) => {
      let balanceWei = new BigNumber(0);
      try {
        if (pool.version === 1) {
          balanceWei = await provider.getBalance(pool.address);
        } else {
          const contract = new ethers.Contract(
            pool.tokenAddress,
            ERC20,
            provider
          );
          balanceWei = await contract.functions.balanceOf(pool.fundSource);
        }
        balanceWei = ethers.utils.formatEther(balanceWei.toString());
        const utilization =
          subgraphPools.find((p) => p.id === pool.address.toLowerCase())
            ?.totalUtilization || "0";
        const utilizationBN = ethers.utils.formatEther(utilization);
        const capacityBN = new BigNumber(balanceWei.toString());
        const valueLockedEth = capacityBN
          .plus(utilizationBN)
          .gt(new BigNumber(Number(pool.ethLimit) || Number.POSITIVE_INFINITY))
          ? new BigNumber(pool.ethLimit ?? "0")
          : capacityBN.plus(utilizationBN);
        tvl = tvl.plus(valueLockedEth);
      } catch (err) {
        console.log(err);
      }
    })
  );

  return {
    "coingecko:ethereum": tvl.toString(),
  };
};

module.exports = {
  methodology:
    "Non-custodial decentralized asset-backed lending protocol that allows borrowers to borrow fungible digital tokens from lenders using non-fungible tokens as collateral",
  ethereum: {
    tvl,
  },
};

const sdk = require("@defillama/sdk");
const { getLogs } = require("../helper/cache/getLogs");
const {
  config: {
    RootPort,
    EVM_CHAIN_ID_FROM_LZ_CHAIN_ID,
    nativeTokenPerChain,
    CHAINS,
  },
} = require("./config");

async function fetchBalancesPerBranch(api, block) {
  const data = await getLogs({
    api,
    target: RootPort,
    topics: [
      "0xbc68f8c6bc7725cd153211b66209e3c2bc0706ec10427059be524f96db68247c",
    ],
    fromBlock: 241817312,
    toBlock: block,
    eventAbi:
      "event LocalTokenAdded(address indexed underlyingAddress, address indexed localAddress, address indexed globalAddress, uint256 chainId)",
  });

  const branchTokensPerChain = data.reduce((memo, log) => {
    const tokenChain = EVM_CHAIN_ID_FROM_LZ_CHAIN_ID[Number(log.args[3])];

    if (!tokenChain) return memo;

    const underlyingAddress = log.args[0];
    const globalAddress = log.args[2];

    return {
      ...memo,
      [globalAddress]: { underlyingAddress, tokenChain },
    };
  }, nativeTokenPerChain);

  const globalAddresses = Object.keys(branchTokensPerChain);

  const balances = await Promise.all(
    globalAddresses.map(
      async (target) =>
        (
          await sdk.api.erc20.totalSupply({
            target,
            block,
            chain: api.chain,
          })
        ).output
    )
  );

  return balances.reduce((memo, balance, i) => {
    const globalAddress = globalAddresses[i];
    const { underlyingAddress, tokenChain } =
      branchTokensPerChain[globalAddress];

    const chainBalances = memo[tokenChain] ?? {};

    return {
      ...memo,
      [tokenChain]: {
        ...chainBalances,
        [tokenChain + ":" + underlyingAddress]: balance,
      },
    };
  }, {});
}

async function tvl(branchChain) {
  const api = new sdk.ChainApi({
    chain: "arbitrum",
    timestamp: sdk.api.timestamp,
  });
  await api.getBlock();

  let balancesPerBranch;
  let lastFetchedBlock;
  let isFetchingBalances = false;

  const block = lastFetchedBlock;

  if (!isFetchingBalances && (!block || block !== api.block)) {
    lastFetchedBlock = api.block;
    isFetchingBalances = true;
    balancesPerBranch = await fetchBalancesPerBranch(api, api.block);
    isFetchingBalances = false;
  }

  await new Promise((resolve) => {
    if (isFetchingBalances) {
      setTimeout(() => resolve(), 1000);
    } else {
      resolve();
    }
  });

  return balancesPerBranch?.[branchChain];
}

CHAINS.forEach(
  async (chain) =>
    (module.exports[chain] = {
      tvl: () => tvl(chain),
    })
);

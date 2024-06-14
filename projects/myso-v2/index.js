const zlib = require("zlib");
const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getCache, setCache } = require("../helper/cache");
const { get } = require("../helper/http");
const { util } = require("@defillama/sdk");

const brotliDecode = (stream) => {
  return new Promise((resolve, reject) => {
    let responseBuffer = [];

    stream.on("data", function handleStreamData(chunk) {
      responseBuffer.push(chunk);
    });

    stream.on("error", function handleStreamError(err) {
      reject(err);
    });

    stream.on("end", function handleStreamEnd() {
      let responseData = Buffer.concat(responseBuffer);

      responseData = responseData.toString("utf8");

      resolve(JSON.parse(responseData));
    });
  });
};

const getContracts = async (chainId) => {
  const response = await get(
    `https://api.myso.finance/chainIds/${chainId}/contracts`,
    {
      decompress: false,
      responseType: "stream",
      transformResponse: (data) => {
        return data.pipe(zlib.createBrotliDecompress());
      },
    }
  );

  const data = await brotliDecode(response);

  return data.contracts;
};

const CoveredCallStrategiesAbi = {
  inputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  name: "strategies",
  outputs: [
    {
      internalType: "address",
      name: "underlying",
      type: "address",
    },
    {
      internalType: "uint128",
      name: "maxDeposits",
      type: "uint128",
    },
    {
      internalType: "uint128",
      name: "minDeposits",
      type: "uint128",
    },
    {
      internalType: "uint128",
      name: "startTime",
      type: "uint128",
    },
    {
      internalType: "uint128",
      name: "tenor",
      type: "uint128",
    },
    {
      internalType: "uint128",
      name: "minStrike",
      type: "uint128",
    },
    {
      internalType: "uint128",
      name: "subscribeEndTime",
      type: "uint128",
    },
    {
      internalType: "uint256",
      name: "totalDeposits",
      type: "uint256",
    },
    {
      internalType: "uint128",
      name: "tokenRewardsPerDeposit",
      type: "uint128",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const whaleMatchTotalSubscriptionsAbi = {
  inputs: [
    {
      internalType: "address",
      name: "",
      type: "address",
    },
  ],
  name: "totalSubscriptions",
  outputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const getBlitzMatchBalances = async (api, contracts, fromBlock) => {
  const vaultFactory = contracts?.find(
    (contract) => contract.type === "vault_factory"
  )?.contractAddr;

  if (!vaultFactory) return {};

  const logs = await getLogs({
    api,
    target: vaultFactory,
    eventAbi:
      "event NewVaultCreated(address indexed newLenderVaultAddr, address vaultOwner, uint256 numRegisteredVaults)",
    onlyArgs: true,
    fromBlock,
  });

  let ownerTokens = logs.map((i) => {
    return [
      contracts
        .filter((contract) => contract.type === "token")
        .map((contract) => contract.contractAddr),
      i.newLenderVaultAddr,
    ];
  });

  return await sumTokens2({
    api,
    ownerTokens,
  });
};

const getCoveredCallOfTheWeekBalances = async (
  api,
  contracts,
  fromBlock,
  balances
) => {
  const coveredCallOfTheWeeks = contracts?.filter(
    (contract) => contract.type === "p2p"
  );

  if (!coveredCallOfTheWeeks) return balances;

  const coveredCallOfTheWeekStrategies = await api.multiCall({
    calls: coveredCallOfTheWeeks.map((contract) => ({
      target: contract?.contractAddr,
      params: [contract.poolData.strategyId],
    })),
    abi: CoveredCallStrategiesAbi,
    withMetadata: true,
  });

  coveredCallOfTheWeekStrategies.forEach((strategy) =>
    util.sumSingleBalance(
      balances,
      strategy.output.underlying.toLowerCase(),
      strategy.output.totalDeposits,
      api.chain
    )
  );

  return balances;
};

const getWhaleMatchBalances = async (api, contracts, fromBlock, balances) => {
  const fundingPoolFactory = contracts.find(
    (contract) => contract.type === "funding_pool_factory"
  )?.contractAddr;

  const fundingPools =
    contracts.filter((contract) => contract.type === "funding_pool") || [];

  if (!(fundingPoolFactory && fundingPools.length)) {
    return balances;
  }

  const logs = await getLogs({
    api,
    target: fundingPoolFactory,
    eventAbi:
      "event LoanProposalCreated(address indexed loanProposalAddr, address indexed fundingPool, address indexed sender, address collToken, uint256 arrangerFee, uint256 unsubscribeGracePeriod, uint256 numLoanProposals)",
    onlyArgs: true,
    fromBlock,
  });

  if (logs.length) {
    try {
      const loanProposalBalances = await api.multiCall({
        calls: logs.map((log) => ({
          target: log?.fundingPool,
          params: [log.loanProposalAddr],
        })),
        abi: whaleMatchTotalSubscriptionsAbi,
        withMetadata: true,
      });

      loanProposalBalances.forEach((loanProposalBalance) =>
        util.sumSingleBalance(
          balances,
          fundingPools
            .find(
              (fundingPool) =>
                fundingPool.contractAddr.toLowerCase() ===
                loanProposalBalance.input.target.toLowerCase()
            )
            ?.loanCcyToken.toLowerCase(),
          loanProposalBalance.output,
          api.chain
        )
      );
    } catch (e) {}
  }

  let ownerTokens = fundingPools.map((fundingPool) => {
    return [[fundingPool.loanCcyToken], fundingPool.contractAddr];
  });

  return await sumTokens2({
    balances,
    api,
    ownerTokens,
  });
};

async function tvl(api) {
  const { fromBlock } = config[api.chain];

  let contracts;

  try {
    contracts = await getContracts(api.chainId);
    await setCache("myso-v2", api.chain, contracts);
  } catch (e) {
    contracts = await getCache("myso-v2", api.chain);
  }

  let balances = await getBlitzMatchBalances(api, contracts, fromBlock);

  balances = await getCoveredCallOfTheWeekBalances(
    api,
    contracts,
    fromBlock,
    balances
  );

  return await getWhaleMatchBalances(api, contracts, fromBlock, balances);
}

const config = {
  mantle: {
    fromBlock: 3471026,
  },
  ethereum: {
    fromBlock: 18213104,
  },
  arbitrum: {
    fromBlock: 143181867,
  },
  base: {
    fromBlock: 6239916,
  },
  evmos: {
    fromBlock: 18112793,
  },
  neon_evm: {
    fromBlock: 237206849,
  },
  telos: {
    fromBlock: 324711636,
  },
  linea: {
    fromBlock: 2118418,
  },
  sei: {
    fromBlock: 79773668,
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});

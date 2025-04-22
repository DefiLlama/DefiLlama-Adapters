const sdk = require("@defillama/sdk");
const { sumTokens2, } = require('../helper/unwrapLPs');
const { cachedGraphQuery } = require('../helper/cache');

const PRIME_MASTER_NETWORK = 'moonbeam';

const PRIME_SATELLITE_NETWORKS = {
  moonbeam: 1284,
  avax: 43114,
  arbitrum: 42161,
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  base: 8453,
  optimism: 10,
  celo: 42220,
  //   filecoin: 314
};

const primeSubgraphUrl = sdk.graph.modifyEndpoint('6LrvPGTZeMZfEQh4p9DvDBBv4G8cjhLs4v3mdiUycERp');

const primeMarketsQuery = `{
    markets { address chainId }
  }`;

const MASTER_VIEW_CONTRACT = {
  v1_4_6: {
    address: '0x47ecFB57deD0160d66103A6A201C5f30f7CC7d13',
    abi: {
      calculateAssetTVL: 'function calculateRawAssetTVL(uint256 chainId, address pToken) view returns (uint256)'
    }
  }
};

const PRIME_CONTRACTS = {
  MASTER_VIEW_v1_4_6: {
    address: '0x47ecFB57deD0160d66103A6A201C5f30f7CC7d13',
    abi: {
      calculateAssetTVL: 'function calculateRawAssetTVL(uint256 chainId, address pToken) view returns (uint256)'
    }
  },
  MASTER_VIEW_v1_10_2: {
    address: '0x30095B6616eB637B72f86E9613cdAcF18C11ED8d',
    abi: {
      getCollateralFactors: 'function getCollateralFactors(address[] memory underlyings, uint256[] memory chainIds) view returns (uint256[] memory collateralFactors)',
    }
  },
  IRM_ROUTER_v1_10_2: {
    address: '0xd7af46089C5ED25871b770F18a2Ff1C07929abfa',
    abi: {
      borrowInterestRatePerBlock: 'function borrowInterestRatePerBlock(address loanAsset, uint256 loanAssetChainId) view returns (uint256)',
    }
  },
  PTOKEN_v1_10_2: {
    abi: {
      underlying: 'function underlying() view returns (address)'
    }
  },
  MASTER_VIEW_v1_10_3: {
    address: '0x9Ee26206Bc1143668aD56498b8C7A621bFa27c00',
    abi: {
      supplierInterestRateWithoutTuple: 'function supplierInterestRateWithoutTuple(uint256 chainId, address loanAsset) view returns (uint256 rate, uint256 factor)'
    }
  },
};

async function getMarketsForCurrentNetwork(api) {
  const { markets: primeMarketsData } = await cachedGraphQuery('prime-protocol', primeSubgraphUrl, primeMarketsQuery)

  const markets = [];

  for (let m = 0; m < primeMarketsData.length; m++) {
    const market = primeMarketsData[m];
    const marketAddress = market.address;
    const marketChainId = market.chainId;

    if (PRIME_SATELLITE_NETWORKS[api.chain] == marketChainId) {
      const underlyingAddress = (
        await api.multiCall({
          abi: PRIME_CONTRACTS.PTOKEN_v1_10_2.abi.underlying,
          calls: [marketAddress].map((ma) => ({
            target: ma,
          })),
          permitFailure: true,
          chain: api.chain,
        })
      )[0];

      markets.push({
        pTokenMarketAddress: marketAddress,
        pTokenUnderlyingAddress: underlyingAddress
      });
    }
  }

  return markets;
}

async function borrowed(api) {
  const moonbeamApi = new sdk.ChainApi({ chain: PRIME_MASTER_NETWORK });

  const markets = await getMarketsForCurrentNetwork(api);

  let uDecimals = await api.multiCall({ abi: 'erc20:decimals', calls: markets.map(market => market.pTokenUnderlyingAddress), permitFailure: true, })
  uDecimals = uDecimals.map(i => i ?? 18)

  let rawTvls = await moonbeamApi.multiCall({
    abi: MASTER_VIEW_CONTRACT.v1_4_6.abi.calculateAssetTVL,
    target: MASTER_VIEW_CONTRACT.v1_4_6.address,
    calls: markets.map(i => ({ params: [PRIME_SATELLITE_NETWORKS[api.chain], i.pTokenMarketAddress] })),
  })

  rawTvls.forEach((v, i) => api.add(markets[i].pTokenUnderlyingAddress, v * (10 ** uDecimals[i] / 1e18)))
  const tvlBal = await sumTokens2({ balances: {}, api, tokensAndOwners: markets.map(market => [market.pTokenUnderlyingAddress, market.pTokenMarketAddress]) })
  Object.entries(tvlBal).forEach(([token, bal]) => {
    api.add(token, bal * -1, { skipChain: true })
  })
}

async function tvl(api) {
  const markets = await getMarketsForCurrentNetwork(api);

  return sumTokens2({ api, tokensAndOwners: markets.map(market => [market.pTokenUnderlyingAddress, market.pTokenMarketAddress]) })
}

module.exports = {
  timetravel: false,
  methodology: 'Adds the deposits of each market to the borrows that were not redeposited into that market.',
};

Object.keys(PRIME_SATELLITE_NETWORKS).forEach(primeSatelliteNetwork => {
  module.exports[primeSatelliteNetwork] = { tvl, borrowed, }
})

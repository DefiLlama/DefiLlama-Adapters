const { getLogs } = require("../helper/cache/getLogs");

module.exports = {
  doublecounted: true,
  methodology: "sum of all the tokens locked in CLPs"
}

const abis = {
  poolCreated: "event PoolCreated (address indexed pool)",
  getPoolId: "function getPoolId() view returns (bytes32)",
  getVault: "address:getVault",
  getPoolTokens: "function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)",
  getPools: "function getPools() view returns (address[])",
  getTokenInfo: "function getTokenInfo() view returns (address[] tokens, tuple(uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenInfo, uint256[] balancesRaw, uint256[] lastBalancesLiveScaled18)"
}

const blacklistedTokens = [
  '0xe07f9d810a48ab5c3c914ba3ca53af14e4491e8a', // GYD ethereum
]

const getGyroPools = async (api, factories) => {
  for (const { factory, fromBlock } of factories) {
    const logs = await getLogs({ api, target: factory, eventAbi: abis.poolCreated, onlyArgs: true, fromBlock })
    const poolAddresses = logs.map(log => log.pool);
    if (poolAddresses.length === 0) continue;

    const [poolIds, vaults] = await Promise.all([
      api.multiCall({ abi: abis.getPoolId, calls: poolAddresses }),
      api.multiCall({ abi: abis.getVault, calls: poolAddresses }),
    ]);

    const poolData = await api.multiCall({ abi: abis.getPoolTokens, calls: poolIds.map((poolId, i) => ({ target: vaults[i], params: poolId })) });
    poolData.forEach(({ tokens, balances }) => { api.addTokens(tokens, balances) }) }
    blacklistedTokens.forEach(token => api.removeTokenBalance(token));
    return api.getBalances();
}

const getBalancerPools = async (api, factories) => {
  if (!factories.length) return;
  const pools = (await api.multiCall({ calls: factories.map(({ factory }) => ({ target: factory })), abi: abis.getPools })).flat()
  const poolsDatas = await api.multiCall({ calls: pools, abi: abis.getTokenInfo })

  poolsDatas.forEach(({ tokens, balancesRaw }) => {
    tokens.forEach((t, i) => {
      api.add(t, balancesRaw[i])
    }) 
  })
}

async function tvl(api) {
  const { gyroFactory, balancerFactory = [] } = config[api.chain];
  await getGyroPools(api, gyroFactory) 
  await getBalancerPools(api, balancerFactory) 
}

const config = {
  polygon: {
    gyroFactory: [
      {
        name: "Gyro 2-CLP Factory",
        factory: "0x5d8545a7330245150bE0Ce88F8afB0EDc41dFc34",
        fromBlock: 31556084,
      },
      {
        name: "Gyro 3-CLP Factory",
        factory: "0x90f08B3705208E41DbEEB37A42Fb628dD483AdDa",
        fromBlock: 31556094,
      },
      {
        name: "Gyro E-CLP Factory",
        factory: "0xD4204551BC5397455f8897745d50Ac4F6beE0EF6",
        fromBlock: 35414865,
      },
      {
        name: "Gyro E-CLP V2 Factory",
        factory: "0x1a79A24Db0F73e9087205287761fC9C5C305926b",
        fromBlock: 41209677,
      },
    ]
  },
  base: {
    gyroFactory: [
      {
        name: "Gyro E-CLP V2 Factory",
        factory: "0x15e86be6084c6a5a8c17732d398dfbc2ec574cec",
        fromBlock: 13035219,
      },
    ],
    balancerFactory: [
      {
        name: "Gyro E-CLP V2 Factory - Balancer",
        factory: "0x5F6848976C2914403B425F18B589A65772F082E3",
        fromBlock: 27590349,
      },
    ]
  },
  sei: {
    gyroFactory: [
      {
        name: "Gyro E-CLP V2 Factory",
        factory: "0xB438ea246cefA9241305aD62E5D307D014baF7Fa",
        fromBlock: 117480059,
      },
    ]
  },
  avax: {
    gyroFactory: [
      {
        name: "Gyro E-CLP V2 Factory",
        factory: "0x41E9ac0bfed353c2dE21a980dA0EbB8A464D946A",
        fromBlock: 50484541,
      },
    ]
  },
  optimism: {
    gyroFactory: [
      {
        name: "Gyro E-CLP V2 Factory",
        factory: "0x9b683ca24b0e013512e2566b68704dbe9677413c",
        fromBlock: 97253023,
      },
    ],
    balancerFactory: [
      {
        name: "Gyro E-CLP V2 Factory - Balancer",
        factory: "0x22625eEDd92c81a219A83e1dc48f88d54786B017",
        fromBlock: 133969692,
      },
    ]
  },
  ethereum: {
    gyroFactory: [
      {
        name: "Gyro E-CLP V2 Factory",
        factory: "0x412a5B2e7a678471985542757A6855847D4931D5",
        fromBlock: 17672894,
      },
    ]
  },
  arbitrum: {
    gyroFactory: [
      {
        name: "Gyro E-CLP V2 Factory",
        factory: "0xdca5f1f0d7994a32bc511e7dba0259946653eaf6",
        fromBlock: 124858976,
      },
    ]
  },
  polygon_zkevm: {
    gyroFactory: [
      {
        name: "Gyro E-CLP V2 Factory",
        factory: "0x5D56EA1B2595d2dbe4f5014b967c78ce75324f0c",
        fromBlock: 5147666,
      },
    ]
  },
  xdai: {
    gyroFactory: [
      {
        name: "Gyro E-CLP V2 Factory",
        factory: "0x5d3Be8aaE57bf0D1986Ff7766cC9607B6cC99b89",
        fromBlock: 33759936,
      },
    ]
  },
  sonic: {
    gyroFactory: [
      {
        name: "Gyro E-CLP V2 Factory",
        factory: "0x5364296D19d453D73f84a94e78681A430e620c5f",
        fromBlock: 5143648,
      },
    ]
  }
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});

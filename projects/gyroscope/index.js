const { getLogs } = require("../helper/cache/getLogs");
module.exports.doublecounted = true;
const blacklistedTokens = [
  '0xe07f9d810a48ab5c3c914ba3ca53af14e4491e8a', // GYD ethereum
]

async function tvl(api) {
  const pools = config[api.chain];

  const promises = pools.map(async ({ factory, fromBlock }) => {
    const logs = await getLogs({
      api,
      target: factory,
      eventAbi: "event PoolCreated (address indexed pool)",
      onlyArgs: true,
      fromBlock,
    });

    const pools = logs.map((i) => i.pool);
    const poolIds = await api.multiCall({
      abi: "function getPoolId() view returns (bytes32)",
      calls: pools,
    });
    const vaults = await api.multiCall({
      abi: "address:getVault",
      calls: pools,
    });

    const data = await api.multiCall({
      abi: "function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)",
      calls: poolIds.map((v, i) => ({ target: vaults[i], params: v })),
    });

    data.forEach((i) => api.addTokens(i.tokens, i.balances));
  });
  await Promise.all(promises);
  blacklistedTokens.map(i => api.removeTokenBalance(i))
  return api.getBalances();
}

module.exports = {
  methodology: "sum of all the tokens locked in CLPs",
};

const config = {
  polygon: [
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
  ],
  optimism: [
    {
      name: "Gyro E-CLP V2 Factory",
      factory: "0x9b683ca24b0e013512e2566b68704dbe9677413c",
      fromBlock: 97253023,
    },
  ],
  ethereum: [
    {
      name: "Gyro E-CLP V2 Factory",
      factory: "0x412a5B2e7a678471985542757A6855847D4931D5",
      fromBlock: 17672894,
    },
  ],
  arbitrum: [
    {
      name: "Gyro E-CLP V2 Factory",
      factory: "0xdca5f1f0d7994a32bc511e7dba0259946653eaf6",
      fromBlock: 124858976,
    },
  ],
  polygon_zkevm: [
    {
      name: "Gyro E-CLP V2 Factory",
      factory: "0x5D56EA1B2595d2dbe4f5014b967c78ce75324f0c",
      fromBlock: 5147666,
    },
  ],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});

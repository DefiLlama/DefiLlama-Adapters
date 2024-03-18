const { getLogs } = require('../helper/cache/getLogs')

const config = {
  arbitrum: {
    network: "arbitrum",
    factory: "0x37215Af590CED3f50a4e3Af8BE903E4307C71C1F",
    helper: "0x6376f97fc9bc9a0ebd03fa89eF8a653A79b41e98",
    fromBlock: 145653947,
  },
};


module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
};

Object.keys(config).forEach((chain) => {
  const { factory, helper, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api }) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi:
          "event VaultCreated(string name, address proxyAddress)",
        onlyArgs: true,
        fromBlock,
      });
      const vaults = logs.map(i => i.proxyAddress)
      for (let i = 0; i < vaults.length; i++) {
        const balances = await api.call({ abi: 'function totalUnderlying(address vault_) external view returns ((address,uint256)[] memory)', target: helper, params: vaults[i] });
        for (let j = 0; j < balances.length; j++) {
          const token0 = balances[j][0];
          const balance = balances[j][1];
          api.add(token0, balance)
        }
      }
    }
  }
});
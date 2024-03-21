const { getLogs } = require('../helper/cache/getLogs')

const config = {
  arbitrum: {
    network: "arbitrum",
    factory: "0x37215Af590CED3f50a4e3Af8BE903E4307C71C1F",
    helper: "0x6376f97fc9bc9a0ebd03fa89eF8a653A79b41e98",
    fromBlock: 145653947,
  },
  optimism: {
    network: "optimism",
    factory: "0xd8B3442D24F98497134904e3C6c14F8b15a451de",
    helper: "0x391E307C9a67bFcbfEa64f82627c2Ab54b1B96d8",
    fromBlock: 112183916,
  },
  polygon: {
    network: "polygon",
    factory: "0x3f28b47050A4B79E515fCfCE2af41744c42084Ae",
    helper: "0x43B0281042590D42ae7Cb62Eb1f8e3124113C0BF",
    fromBlock: 49963323,
  },
  blast: {
    network: "blast",
    factory: "0xAe2F0EdEE8d02a13889055Aa94BDDA263bEF0520",
    helper: "0xEe99ac9893811B3006ce1fceE78cdc7Fd2375724",
    fromBlock: 232415,
  },
};


module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
};

Object.keys(config).forEach((chain) => {
  const { factory, helper, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
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
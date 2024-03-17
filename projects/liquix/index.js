const { getLogs } = require('../helper/cache/getLogs')
const { covalentGetTokens } = require('../helper/token')
const { sleep } = require("../helper/utils");
const { getUniqueAddresses } = require('../helper/utils');

const config = {
  arbitrum: {
    network: "arbitrum",
    factory: "0x37215Af590CED3f50a4e3Af8BE903E4307C71C1F",
    helper: "0x6376f97fc9bc9a0ebd03fa89eF8a653A79b41e98",
    fromBlock: 145653947,
  },
};

const blacklistedTokens = [
]

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  timetravel: false,
};

async function getTokens(api, owners) {
  let tokens = []
  for (let i = 0; i < owners.length; i++) {
    const owner = owners[i];
    let new_tokens = await covalentGetTokens(owner, api, { onlyWhitelisted: true, });
    tokens.push(...new_tokens);
    await sleep(300)
  }
  console.log(tokens)
  tokens = getUniqueAddresses(tokens)
  return tokens
}

Object.keys(config).forEach((chain) => {
  const { factory, helper, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: [
          "0x14db5e0167c5e77f0a48cedd835dd30b2dcd630caff2e8e5d2411b892a094324",
        ],
        eventAbi:
          "event VaultCreated(string name, address proxyAddress)",
        onlyArgs: true,
        fromBlock,
      });
      const vaults = logs.map(i => i.proxyAddress)
      for (i = 0; i < vaults.length; i++) {
        const balances = await api.call({ abi: 'function totalUnderlying(address vault_) external view returns ((address,uint256)[] memory)', target: helper, params: vaults[i] });
        for (j = 0; j < balances.length; j++) {
          const token0 = balances[j][0];
          const balance = balances[j][1];
          api.add(token0, balance)
        }
      }
    }
  }
});
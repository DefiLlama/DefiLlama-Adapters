const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const abi = {
  sc: "address:sc",
}

const vaultFactories = {
  ethereum: "0x0150b57aa8cc6fcbc110f07eef0c85731d8aacf4",
  arbitrum: "0x0150b57aa8cc6fcbc110f07eef0c85731d8aacf4",
  bsc: "0x0150b57aa8cc6fcbc110f07eef0c85731d8aacf4",
};

const fromBlocks = {
  ethereum: 15912005,
  arbitrum: 54210090,
  bsc: 29123165,
};

async function tvl(api) {
  const { chain } = api
  const logs = await getLogs({
    api,
    target: vaultFactories[chain], // vault factory
    topic: "VaultDeployed(address,bytes32,string,string)",
    fromBlock: fromBlocks[chain],
    eventAbi: 'event VaultDeployed (address vault, bytes32 coverKey, string name, string symbol)',
  });

  const vaults = logs.map((log) => log.args.vault)
  const tokens = await api.multiCall({
    abi: abi.sc,
    calls: vaults,
  })
  const toa = tokens.map((token, i) => ([token, vaults[i]]))

  return sumTokens2({ api, tokensAndOwners: toa, chain })
}

module.exports = {
  methodology: "TVL consists of the total liquidity available in the cover pools",
  start: 1667260800, // Nov 01 2022 @ 12:00am (UTC)
  ethereum: { tvl },
  arbitrum: { tvl },
  bsc: { tvl },
};

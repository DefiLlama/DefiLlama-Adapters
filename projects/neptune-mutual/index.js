const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const abi = {
  sc: "address:sc",
}

const npm = {
  ethereum: "0x57f12fe6a4e5fe819eec699fadf9db2d06606bb4",
  arbitrum: "0x57f12fe6a4e5fe819eec699fadf9db2d06606bb4",
  bsc: "0x57f12fe6a4e5fe819eec699fadf9db2d06606bb4",
};

const usdc = {
  arbitrum: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
};

const treasury = {
  arbitrum: "0x808ca06eec8d8645386be4293a7f4428d4994f5b",
};

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

async function tvl(_, block, _1, { api, chain }) {
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

  const toa = []

  // stablecoin, vault
  toa.push(...tokens.map((token, i) => ([token, vaults[i]])))

  // npm, vault
  if (npm[chain]) {
    toa.push(...vaults.map((vault, i) => ([npm[chain], vault])))
  }

  if (usdc[chain] && treasury[chain]) {
    toa.push([usdc[chain], treasury[chain]])
  }

  if (npm[chain] && treasury[chain]) {
    toa.push([npm[chain], treasury[chain]])
  }

  const vaultTvl = await sumTokens2({ api, tokensAndOwners: toa, chain, resolveLP: true })

  console.log(vaultTvl);

  return vaultTvl
}

module.exports = {
  methodology: "TVL consists of the total liquidity available in the cover pools",
  start: 1667260800, // Nov 01 2022 @ 12:00am (UTC)
  ethereum: { tvl },
  arbitrum: { tvl },
  bsc: { tvl },
};

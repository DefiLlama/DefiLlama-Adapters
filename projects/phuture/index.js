const sdk = require("@defillama/sdk");
const indexAbi = require("./abis/Index.abi.json");
const vTokenAbi = require("./abis/vToken.abi.json");
const vTokenFactoryAbi = require("./abis/vTokenFactory.abi.json");
const savingsVaultAbi = require("./abis/SavingsVault.abi.json");
const networks = require("./networks.json");
const { getChainTransform } = require("../helper/portedTokens");

const indexTvl = (chain) => async (timestamp, block, chainBlocks) => {
  const { output: anatomy } = await sdk.api.abi.multiCall({
    chain,
    block: chainBlocks[chain],
    calls: networks[chain]["indexes"].map((target) => ({ target })),
    abi: indexAbi.anatomy
  });

  const indexes = Object.fromEntries(
    anatomy.map(({ input, output: { _assets } }) => [
      input.target,
      _assets
    ]
    )
  );

  const { output: inactiveAnatomy } = await sdk.api.abi.multiCall({
    chain,
    block: chainBlocks[chain],
    calls: networks[chain]["indexes"].map((target) => ({ target })),
    abi: indexAbi.inactiveAnatomy
  });

  for (const { output, input: { target } } of inactiveAnatomy)
    indexes[target].push(...output);

  const { output: vTokenFactories } = await sdk.api.abi.multiCall({
    chain,
    block: chainBlocks[chain],
    calls: networks[chain]["indexes"].map((target) => ({ target })),
    abi: indexAbi.vTokenFactory
  });

  const vTokens = {};
  for (const { output, input: { target } } of vTokenFactories) {
    const { output: vTokenOf } = await sdk.api.abi.multiCall({
      chain,
      block: chainBlocks[chain],
      calls: indexes[target].map((address) => ({ target: output, params: address })),
      abi: vTokenFactoryAbi.vTokenOf
    });

    for (const { output, input: { params } } of vTokenOf)
      vTokens[output] = params[0];
  }

  const { output: virtualTotalAssetSupplies } = await sdk.api.abi.multiCall({
    abi: vTokenAbi.virtualTotalAssetSupply,
    calls: Object.keys(vTokens).map((target) => ({ target })),
    block: chainBlocks[chain],
    chain
  });

  const chainTransform = await getChainTransform(chain);

  return Object.fromEntries(
    virtualTotalAssetSupplies.map(({ input: { target }, output }) => [
      chainTransform(vTokens[target]),
      output
    ])
  );
};

const savingsVaultTvl = (chain) => async (api) => {
  const calls = networks[chain]["savingsVaults"]
  const [assets, totalAssets] = await Promise.all([
    api.multiCall({ abi: savingsVaultAbi.asset, calls }),
    api.multiCall({ abi: savingsVaultAbi.totalAssets, calls, permitFailure: true })
  ])

  const balances = {};
  calls.forEach((call, i) => {
    const asset = assets[i]
    const bal = totalAssets[i]
    if(!bal) return;
    sdk.util.sumSingleBalance(balances, asset, bal, chain)
  })

  return balances
};

module.exports = {
  methodology: "TVL considers tokens deposited to Phuture Products",
    misrepresentedTokens: true,
  ethereum: {
    tvl: sdk.util.sumChainTvls([
      indexTvl("ethereum"),
      savingsVaultTvl("ethereum")
    ])
  },
  avax: {
    tvl: indexTvl("avax")
  }
};

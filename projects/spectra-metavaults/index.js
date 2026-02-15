const sdk = require("@defillama/sdk");
const config = require("./config.json");

const abi = {
  metavaultRegistry: {
    chainsCount: "function chainsCount(address metavault) view returns (uint256)",
  },
  metavault: {
    getInfraVault: "function getInfraVault() view returns (address)",
  },
  infraVault: {
    totalAssets: "function totalAssets() view returns (uint256)",
    asset: "function asset() view returns (address)",
  },
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const metavaultWrapperInitializedEventAbi =
  "event MetaVaultWrapperInitialized(address indexed owner, address indexed infraVault, address indexed wrapper)";

const isMetavaultCountValid = (count) => {
  if (count === null || count === undefined) return false;
  try {
    return BigInt(count) >= 1n;
  } catch (e) {
    return +count >= 1;
  }
};

const getMetavaultTVL = async (api, metavaultSources) => {
  if (!metavaultSources.length) return;

  const metavaultFromBlock = Math.min(
    ...metavaultSources.map(({ fromBlock }) => fromBlock)
  );
  let toBlock = api.block;
  if (!toBlock) {
    try {
      toBlock = await api.getBlock();
    } catch (e) {
      return;
    }
  }

  const logs = await sdk.getEventLogs({
    chain: api.chain,
    fromBlock: metavaultFromBlock,
    toBlock,
    noTarget: true,
    eventAbi: metavaultWrapperInitializedEventAbi,
  });

  const wrappersMap = {};
  logs.forEach((log) => {
    const owner = log.owner ?? log?.args[0];
    const wrapper = log.wrapper ?? log?.args[2];
    const infraVaultFromEvent = log.infraVault ?? log?.args[1];

    if (!owner || !wrapper) return;
    wrappersMap[wrapper.toLowerCase()] = { owner, wrapper, infraVaultFromEvent };
  });

  const wrappers = Object.values(wrappersMap);
  if (!wrappers.length) return;

  const registryCounts = await Promise.all(
    metavaultSources.map(({ metavaultRegistry }) =>
      api.multiCall({
        target: metavaultRegistry,
        calls: wrappers.map(({ owner }) => ({ params: [owner] })),
        abi: abi.metavaultRegistry.chainsCount,
        permitFailure: true,
      })
    )
  );

  const validWrappers = wrappers.filter((_, i) =>
    registryCounts.some((counts) => isMetavaultCountValid(counts[i]))
  );
  if (!validWrappers.length) return;

  const wrapperInfraVaults = await api.multiCall({
    calls: validWrappers.map(({ wrapper }) => ({ target: wrapper })),
    abi: abi.metavault.getInfraVault,
    permitFailure: true,
  });

  const uniqueInfraVaults = {};
  validWrappers.forEach(({ infraVaultFromEvent }, i) => {
    let infraVault = wrapperInfraVaults[i];
    if (!infraVault || infraVault.toLowerCase() === ZERO_ADDRESS)
      infraVault = infraVaultFromEvent;
    if (!infraVault || infraVault.toLowerCase() === ZERO_ADDRESS) return;
    uniqueInfraVaults[infraVault.toLowerCase()] = infraVault;
  });

  const infraVaults = Object.values(uniqueInfraVaults);
  if (!infraVaults.length) return;

  const [assets, totalAssets] = await Promise.all([
    api.multiCall({
      calls: infraVaults,
      abi: abi.infraVault.asset,
      permitFailure: true,
    }),
    api.multiCall({
      calls: infraVaults,
      abi: abi.infraVault.totalAssets,
      permitFailure: true,
    }),
  ]);

  assets.forEach((asset, i) => {
    const balance = totalAssets[i];
    if (!asset || asset.toLowerCase() === ZERO_ADDRESS || !balance) return;
    api.add(asset, balance);
  });
};

const tvl = async (api) => {
  const sources = config[api.chain];
  const metavaultSources = sources.filter(
    ({ metavaultRegistry }) => metavaultRegistry
  );
  await getMetavaultTVL(api, metavaultSources);
};

module.exports = {
  methodology: `TVL is the total value of assets deposited in Spectra MetaVaults.`,
  hallmarks: [["2026-02-12", "MetaVaults Launch"]],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});

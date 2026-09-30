const sdk = require("@defillama/sdk");
const { nullAddress } = require("../helper/tokenMapping");

const NAV_DECIMALS = 18n;
const PRINCIPAL_CONTAINER_TYPE = 1;

const abi = {
  getContainers: "function getContainers() view returns (address[] containers, uint256[] weights)",
  containerType: "uint8:containerType",
  remoteChainId: "uint256:remoteChainId",
  isReshuffling: "bool:isReshuffling",
  getStrategiesNav: "uint256:getStrategiesNav",
  getPreReshufflingSnapshot: "uint256:getPreReshufflingSnapshot",
  notion: "address:notion",
  decimals: "uint8:decimals",
};


// Chain -> Vault address -> TvlReporter
const vaults = {
  ethereum: {
    "0x1d71c888961c4600cF0E31F6196b4dA7fE72e4B3": "0x0A4420823e2c415C9D5ABC668b0915b62f7409Fb",
  },
};

const chainNamesById = Object.fromEntries(
  Object.entries(sdk.providerListJSON ?? {})
    .filter(([, { chainId }]) => chainId)
    .map(([name, { chainId }]) => [chainId, name])
);

async function getVaultNav(api, vault, tvlReporter) {
  const [containersRes, isReshuffling] = await Promise.all([
    api.call({ target: vault, abi: abi.getContainers }),
    api.call({ target: vault, abi: abi.isReshuffling }),
  ]);
  const containers = (containersRes.containers ?? containersRes[0] ?? []).filter(
    (c) => c && c !== nullAddress
  );
  if (!containers.length) return 0n;

  const containerTypes = await api.multiCall({ abi: abi.containerType, calls: containers });
  const principalContainers = containers.filter(
    (_, index) => Number(containerTypes[index]) === PRINCIPAL_CONTAINER_TYPE
  );
  const chainIds = new Set();

  if (principalContainers.length < containers.length) {
    chainIds.add(Number(api.chainId));
  }
  if (principalContainers.length) {
    const remoteChainIds = await api.multiCall({
      abi: abi.remoteChainId,
      calls: principalContainers,
    });
    remoteChainIds.forEach((chainId) => chainIds.add(Number(chainId)));
  }

  const navAbi = isReshuffling ? abi.getPreReshufflingSnapshot : abi.getStrategiesNav;
  const navs = await Promise.all([...chainIds].map((chainId) => {
    if (chainId === Number(api.chainId)) {
      return api.call({ target: tvlReporter, abi: navAbi });
    }

    const chain = chainNamesById[chainId];
    if (!chain) throw new Error(`Unknown chainId ${chainId}`);
    const chainApi = new sdk.ChainApi({ chain, timestamp: api.timestamp });
    return chainApi.call({ target: tvlReporter, abi: navAbi });
  }));
  return navs.reduce((total, nav) => total + BigInt(nav), 0n);
}

async function tvl(api) {
  await Promise.all(
    Object.entries(vaults[api.chain] ?? {}).map(async ([vault, tvlReporter]) => {
      const [nav, notion] = await Promise.all([
        getVaultNav(api, vault, tvlReporter),
        api.call({ target: vault, abi: abi.notion }),
      ]);
      const notionDecimals = BigInt(await api.call({ target: notion, abi: abi.decimals }));
      const tokenAmount = notionDecimals < NAV_DECIMALS
        ? nav / 10n ** (NAV_DECIMALS - notionDecimals)
        : nav * 10n ** (notionDecimals - NAV_DECIMALS);
      api.add(
        notion,
        tokenAmount
      );
    })
  );
}

module.exports = {
  doublecounted: true,
  methodology:
    "Shift DeFi's total protocol TVL is calculated as the sum of the TVLs of all Vaults within the ecosystem. Each Vault's TVL is calculated as the sum of the NAVs of all strategies that make up the Vault's portfolio, as reported on-chain by each chain's TvlReporter. Strategies deposit into Curve and Morpho, so these assets are also counted in those protocols.",
};

Object.keys(vaults).forEach((chain) => {
  module.exports[chain] = { tvl };
});

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
  logic: "address:logic",
  getDefiisFor: "function getDefiisFor(address owner) view returns (address[])",
  getOpsFor: "function getOpsFor(address owner) view returns (address[])",
  getWhitelistedTokens: "function getWhitelistedTokens() view returns (address[])",
  underlyingTokensBalances: "function underlyingTokensBalances(address defii) view returns (address[] tokens, uint256[] amounts)",
};


// Chain -> Vault address -> TvlReporter
const vaults = {
  ethereum: {
    "0x1d71c888961c4600cF0E31F6196b4dA7fE72e4B3": "0x0A4420823e2c415C9D5ABC668b0915b62f7409Fb",
  },
};

// Chain -> Institutional Private Vaults: the SelfManagedFactory and the account whose positions it tracks
const privateVaults = {
  ethereum: [
    { factory: "0x3FaD5aFBA6e3169C9c688aaC3Ba77200c5168378", account: "0x8FcC3aAc6b16dC821B7E4A2841b2Db3a9c999B4C" },
  ],
};

const chainNamesById = Object.fromEntries(
  Object.entries(sdk.providerListJSON ?? {})
    .filter(([, { chainId }]) => chainId)
    .map(([name, { chainId }]) => [chainId, name])
);

function getChainApi(api, chainId) {
  if (chainId === Number(api.chainId)) return api;
  const chain = chainNamesById[chainId];
  if (!chain) throw new Error(`Unknown chainId ${chainId}`);
  return new sdk.ChainApi({ chain, timestamp: api.timestamp });
}

// Adds an 18-decimal value as an amount of `token`
async function addNav(api, token, nav) {
  const decimals = BigInt(await api.call({ target: token, abi: abi.decimals }));
  const amount = decimals < NAV_DECIMALS
    ? nav / 10n ** (NAV_DECIMALS - decimals)
    : nav * 10n ** (decimals - NAV_DECIMALS);
  api.add(token, amount);
}

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
  const navs = await Promise.all([...chainIds].map((chainId) =>
    getChainApi(api, chainId).call({ target: tvlReporter, abi: navAbi })
  ));
  return navs.reduce((total, nav) => total + BigInt(nav), 0n);
}

// Strategy (defii) positions as underlying tokens, plus whitelisted token balances held by the
// account and its ops addresses
async function privateVaultsTvl(api) {
  for (const { factory, account } of privateVaults[api.chain] ?? []) {
    const defiis = await api.call({ target: factory, abi: abi.getDefiisFor, params: [account] });
    const logics = await api.multiCall({ abi: abi.logic, calls: defiis });
    const positions = await api.multiCall({
      abi: abi.underlyingTokensBalances,
      calls: defiis.map((defii, i) => ({ target: logics[i], params: [defii] })),
    });
    positions.forEach(({ tokens, amounts }) => tokens.forEach((token, i) => api.add(token, amounts[i])));

    const ops = await api.call({ target: factory, abi: abi.getOpsFor, params: [account] });
    const tokens = await api.call({ target: factory, abi: abi.getWhitelistedTokens });
    await api.sumTokens({ owners: [account, ...ops], tokens });
  }
}

async function liquidVaultsTvl(api) {
  for (const [vault, tvlReporter] of Object.entries(vaults[api.chain] ?? {})) {
    const nav = await getVaultNav(api, vault, tvlReporter);
    const notion = await api.call({ target: vault, abi: abi.notion });
    await addNav(api, notion, nav);
  }
}

async function tvl(api) {
  await liquidVaultsTvl(api);
  await privateVaultsTvl(api);
}

module.exports = {
  doublecounted: true,
  methodology:
    "Shift DeFi's total protocol TVL is calculated as the sum of the TVLs of all Vaults within the ecosystem. Each Vault's TVL is calculated as the sum of the NAVs of all strategies that make up the Vault's portfolio, as reported on-chain by each chain's TvlReporter. Strategies deposit into Curve and Morpho, so these assets are also counted in those protocols. Institutional Private Vaults are counted as tokens: the underlying token balances of each strategy (defii) the vault's account holds in the SelfManagedFactory, plus the factory's whitelisted tokens held by the account and its ops addresses.",
};

new Set([...Object.keys(vaults), ...Object.keys(privateVaults)]).forEach((chain) => {
  module.exports[chain] = { tvl };
});

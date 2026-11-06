const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");
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
  tvl: "uint256:tvl",
  getReportedChainIds: "function getReportedChainIds() view returns (uint256[])",
};


// Chain -> Vault address -> TvlReporter
const vaults = {
  ethereum: {
    "0x1d71c888961c4600cF0E31F6196b4dA7fE72e4B3": "0x0A4420823e2c415C9D5ABC668b0915b62f7409Fb",
  },
};

// Chain -> MaTvlReporter holding the reported chain ids; same address on each reported chain
// tvl() is USD scaled to 1e18, reported as USDC
const maTvlReporters = {
  ethereum: { address: "0x81a9459eB66018c8C0B9F0A2e3fcF9f5Cd8e6F28", startBlock: 26349845 },
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

async function maTvl(api) {
  const { address: reporter, startBlock } = maTvlReporters[api.chain] ?? {};
  if (!reporter || (await api.getBlock()) < startBlock) return;
  const chainIds = await api.call({ target: reporter, abi: abi.getReportedChainIds });
  const values = await Promise.all(chainIds.map((chainId) =>
    getChainApi(api, Number(chainId)).call({ target: reporter, abi: abi.tvl })
  ));
  const usdValue = values.reduce((total, value) => total + BigInt(value), 0n);
  await addNav(api, ADDRESSES[api.chain].USDC, usdValue);
}

async function liquidVaultsTvl(api) {
  await Promise.all(
    Object.entries(vaults[api.chain] ?? {}).map(async ([vault, tvlReporter]) => {
      const [nav, notion] = await Promise.all([
        getVaultNav(api, vault, tvlReporter),
        api.call({ target: vault, abi: abi.notion }),
      ]);
      await addNav(api, notion, nav);
    })
  );
}

async function tvl(api) {
  await Promise.all([liquidVaultsTvl(api), maTvl(api)]);
}

module.exports = {
  doublecounted: true,
  methodology:
    "Shift DeFi's total protocol TVL is calculated as the sum of the TVLs of all Vaults within the ecosystem. Each Vault's TVL is calculated as the sum of the NAVs of all strategies that make up the Vault's portfolio, as reported on-chain by each chain's TvlReporter. Strategies deposit into Curve and Morpho, so these assets are also counted in those protocols. Institutional Private Vault is added from the MaTvlReporter on each chain listed by the Ethereum reporter, which reports the USD value of the Vault's strategy positions and whitelisted stablecoin balances, priced with Chainlink-style oracles.",
};

new Set([...Object.keys(vaults), ...Object.keys(maTvlReporters)]).forEach((chain) => {
  module.exports[chain] = { tvl };
});

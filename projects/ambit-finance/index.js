const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const REGISTRY = "0x5b1eFC3057E941439C487E67761F348D19Dd4100";

const REGISTRY_KEYS = {
  "ambit.asset.storage":
    "0x7267fae8044d9c0f406ec1d6bfdfdb3a4afea229fceedb3c88cc26df2ac97809",
  "ambit.depositorVault":
    "0x970bffd07196f826592058a2977d8df91d0b38816ca31aaaa6a628eda0328dbe",
  "ambit.depositorVault.token":
    "0x8e9a5206de4051330868a4fdef94140eaddce6206903c36de600007efb237b8d",
  "ambit.market":
    "0xcc0fa1d8c6527b2fc2cd5cbed9e80e1843330af5cd1d34a45c3f125a60dc07aa",
};

const ABI = {
  IAddressRegistry: {
    getAddresses:
      "function getAddresses(bytes32[] calldata keys) view returns (address[] memory)",
  },
  IAssetStorage: {
    getAssets:
      "function getAssets() view returns ((address,address,address,address,uint16,uint16,uint256,(address,uint16))[])",
  },
  ICustodian: {
    getTotalAssets: "function getTotalAssets() view returns (uint256)",
  },
  IDepositorVault: {
    getTotalAssets: "function getTotalAssets() view returns (uint256)",
    getLiabilities:
      "function getLiabilities(address account) view returns (uint256)",
  },
};

const AUSD = "0xf328ed974e586b6eea7997a87ea2ab1de149b186";

async function tvl(api) {
  const tokensAndOwners = []
  const [storage, depositorVault] = await api.call({
    abi: ABI["IAddressRegistry"]["getAddresses"],
    target: REGISTRY,
    params: [
      [
        REGISTRY_KEYS["ambit.asset.storage"],
        REGISTRY_KEYS["ambit.depositorVault"],
      ],
    ],
  });
  tokensAndOwners.push([ADDRESSES.bsc.USDT, depositorVault]);
  // supply side
  const assets = await api.call({ abi: ABI["IAssetStorage"]["getAssets"], target: storage, });
  assets.forEach(i => tokensAndOwners.push([i[0], i[1]]))
  return sumTokens2({ api, tokensAndOwners, blacklistedTokens: [AUSD] });
}

async function borrowed(api) {
  const [depositorVault, market] = await api.call({
    abi: ABI["IAddressRegistry"]["getAddresses"],
    target: REGISTRY,
    params: [
      [REGISTRY_KEYS["ambit.depositorVault"], REGISTRY_KEYS["ambit.market"]],
    ],
  });

  const liabilities = await api.call({ abi: ABI["IDepositorVault"]["getLiabilities"], target: depositorVault, params: market });
  api.add(ADDRESSES.bsc.USDT, liabilities);
  return api.getBalances()
}

module.exports = {
  bsc: {
    tvl,
    borrowed,
  },
  methodology: "Gets the TVL for the protocol",
};

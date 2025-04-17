const { getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const ABIS = {
  Market: {
    tokens:
      "function tokens() external view override returns (address fixedToken, address xToken, address gearingToken, address collateral, address debt)",
  },
  Vault: {
    asset: "address:asset",
  },
};

const Events = {
  CreateMarket:
    "event CreateMarket(address indexed market, address indexed collateral, address indexed debtToken)",
  CreateVault:
    "event CreateVault(address indexed vault, address indexed creator, (address,address,uint256,address,uint256,string,string,uint64) initialParams)",
};

const ADDRESSES = {
  arbitrum: {
    Factory: {
      address: "0x14920eb11b71873d01c93b589b40585dacfca096",
      fromBlock: 322193553,
    },
    VaultFactory: [
      {
        address: "0x929cbcb8150ad59db63c92a7daec07b30d38ba79",
        fromBlock: 322193571,
      },
    ],
  },
  ethereum: {
    Factory: {
      address: "0x37ba9934aaba7a49cc29d0952c6a91d7c7043dbc",
      fromBlock: 22174761,
    },
    VaultFactory: [
      {
        address: "0x01d8c1e0584751085a876892151bf8490e862e3e",
        fromBlock: 22174789,
      },
      {
        address: "0x4778cbf91d8369843281c8f5a2d7b56d1420dff5",
        fromBlock: 22283092,
      },
    ],
  },
};

async function getMarketAddresses(api) {
  const logs = await getLogs2({
    api,
    eventAbi: Events.CreateMarket,
    fromBlock: ADDRESSES[api.chain].Factory.fromBlock,
    target: ADDRESSES[api.chain].Factory.address,
  });
  return logs.map(([market]) => market);
}

async function getMarketTVL(api) {
  const marketAddresses = await getMarketAddresses(api);
  const tokens = await api.multiCall({
    abi: ABIS.Market.tokens,
    calls: marketAddresses,
  });
  const ownerTokens = [];
  for (let i = 0; i < marketAddresses.length; i += 1) {
    const marketAddress = marketAddresses[i];
    const { collateral, debt, gearingToken } = tokens[i];
    ownerTokens.push([[collateral], gearingToken]);
    ownerTokens.push([[debt], marketAddress]);
  }
  return ownerTokens;
}

async function getVaultAddresses(api) {
  const addresses = [];
  const promises = [];
  for (const vaultFactory of ADDRESSES[api.chain].VaultFactory) {
    const promise = async () => {
      const logs = await getLogs2({
        api,
        eventAbi: Events.CreateVault,
        fromBlock: vaultFactory.fromBlock,
        target: vaultFactory.address,
      });
      for (const log of logs) {
        const [vault] = log;
        addresses.push(vault);
      }
    };
    promises.push(promise());
  }
  await Promise.all(promises);
  return addresses;
}

async function getVaultTVL(api) {
  const vaultAddresses = await getVaultAddresses(api);
  const assets = await api.multiCall({
    abi: ABIS.Vault.asset,
    calls: vaultAddresses,
  });
  return assets.map(([asset], idx) => [[asset], vaultAddresses[idx]]);
}

async function getTVL(api) {
  const [marketOwnerTokens, vaultOwnerTokens] = await Promise.all([
    getMarketTVL(api),
    getVaultTVL(api),
  ]);
  const ownerTokens = [].concat(marketOwnerTokens).concat(vaultOwnerTokens);
  return sumTokens2({ api, ownerTokens });
}

module.exports = {
  arbitrum: { tvl: getTVL },
  ethereum: { tvl: getTVL },
};

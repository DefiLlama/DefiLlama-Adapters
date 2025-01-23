const { ApiPromise, WsProvider } = require("@polkadot/api");
const BigNumber = require("bignumber.js");
const { getConfig } = require("../helper/cache");

const nativeTokenId = "1";

function formatNumber(text) {
  return String(text ?? "").replace(/,/g, "");
}

function formatAssetIndex(assetId) {
  const formattedAssetId = formatNumber(assetId);
  return formattedAssetId === "0" ? nativeTokenId : formattedAssetId;
}

async function getCoinGeckoTokenData() {
  const data = await getConfig('mantadex', 
    "https://raw.githubusercontent.com/Manta-Network/manta-chaindata/main/tokens.json"
  );
  const result = data.reduce(
    (total, item) => {
      const chain = item.id.split("-")[0];
      if (total[chain]) {
        total[chain][item.logoKey] = item.coinGeckoKey;
      }
      return total;
    },
    { manta: {}, calamari: {} }
  );
  return result;
}

async function getTokenInfos(apiPromise) {
  const tokenListOnChain = (
    await apiPromise.query.assetManager.assetIdMetadata.entries()
  ).map(([key, value]) => [key.toHuman(), value.toHuman()]);

  return tokenListOnChain.reduce(
    (total, item) => {
      const assetId = parseInt(formatNumber(item[0][0]), 10);
      const symbol = item[1].metadata.symbol;
      const decimals = parseInt(formatNumber(item[1].metadata.decimals), 10);
      total.decimals[symbol] = decimals;
      total.assetIds[assetId] = symbol;
      return total;
    },
    { decimals: {}, assetIds: {} }
  );
}

async function getTokenBalance(apiPromise, account, assetIndex) {
  if (assetIndex === nativeTokenId) {
    const response = await apiPromise.query.system.account(account);
    return formatNumber(response.toHuman().data.free);
  } else {
    const response = await apiPromise.query.assets.account(assetIndex, account);
    return formatNumber(response.toHuman().balance);
  }
}

async function tvl() {
  const coinGeckoTokenData = (await getCoinGeckoTokenData()).manta;

  const polkadotProvider = new WsProvider("wss://ws.archive.manta.systems");
  const polkadotApi = await ApiPromise.create({ provider: polkadotProvider });

  const { decimals, assetIds } = await getTokenInfos(polkadotApi);

  const polkadotPools =
    await polkadotApi.query.zenlinkProtocol.pairStatuses.entries();

  const result = {};
  await Promise.all(
    polkadotPools.map(async (pool) => {
      const tokens = pool[0].toHuman()[0];
      const pairAccount = pool[1].toHuman().Trading.pairAccount;
      const token0Index = formatAssetIndex(tokens[0].assetIndex);
      const token1Index = formatAssetIndex(tokens[1].assetIndex);
      const token0Balance = await getTokenBalance(
        polkadotApi,
        pairAccount,
        token0Index
      );
      const token1Balance = await getTokenBalance(
        polkadotApi,
        pairAccount,
        token1Index
      );
      result[assetIds[token0Index]] = (
        result[assetIds[token0Index]] ?? new BigNumber(0)
      ).plus(token0Balance);
      result[assetIds[token1Index]] = (
        result[assetIds[token1Index]] ?? new BigNumber(0)
      ).plus(token1Balance);
    })
  );

  return Object.keys(result).reduce((total, symbol) => {
    total[coinGeckoTokenData[symbol]] = result[symbol]
      .div(10 ** decimals[symbol])
      .toFixed(4);
    return total;
  }, {});
}

module.exports = {
  timetravel: false,
  methodology: "Liquidity Pools from MantaDEX",
  manta_atlantic: { tvl },
};

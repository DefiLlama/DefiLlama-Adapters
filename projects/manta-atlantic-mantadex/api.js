const { ApiPromise, WsProvider } = require("@polkadot/api");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");
const { get } = require('../helper/http')

// node test.js projects/manta-atlantic-mantadex/api.js

async function getCoinGeckoTokenData() {
  const { data } = await get('https://raw.githubusercontent.com/Manta-Network/manta-chaindata/main/tokens.json');
  return data.reduce((total, item) => {
    const { id, logoKey, coinGeckoKey } = item;
    const chain = id.split('-')[0];
    if (!total[chain]) {
      return;
    }
    total[chain][logoKey] = coinGeckoKey;
  }, { manta: {}, calamari: {}});
}

async function tvl() {
  const coinGeckoTokenData = (await getCoinGeckoTokenData()).manta;

  // fetch allowlist token list
  const polkadotProvider = new WsProvider(
    "wss://ws.archive.manta.systems"
  );
  const polkadotApi = await ApiPromise.create({ provider: polkadotProvider });


  // pairStatuses: 
  // [
  //   [
  //     [
  //       {
  //         chainId: 2,104
  //         assetType: 0
  //         assetIndex: 0
  //       }
  //       {
  //         chainId: 2,104
  //         assetType: 2
  //         assetIndex: 9
  //       }
  //     ]
  //   ]
  //   {
  //     Trading: {
  //       pairAccount: dfZ2W8UP6LgvVLKEzTtoZgPzrS2kSVm7FkbrUKXTpKsC1VBzk
  //       totalSupply: 6,076,901,957,527,190
  //     }
  //   }
  // ]


  // liquidityPairs
  // [
  //   [
  //     [
  //       {
  //         chainId: 2,104
  //         assetType: 0
  //         assetIndex: 0
  //       }
  //       {
  //         chainId: 2,104
  //         assetType: 2
  //         assetIndex: 10
  //       }
  //     ]
  //   ]
  //   {
  //     chainId: 2,104
  //     assetType: 2
  //     assetIndex: 37
  //   }
  // ]

  // system.account('pairAccount'): native token balance
  // assets.account('assetIndex', 'pairAccount'): non-native token balance

  // all token decimals
  // const tokenListOnChain = (
  //   await api.query.assetManager.assetIdMetadata.entries()
  // ).map(([key, value]) => [key.toHuman(), value.toHuman()])

  return {};
}

module.exports = {
  timetravel: false,
  methodology: "Liquidity Pools from MantaDEX",
  "manta-atlantic": { tvl },
};

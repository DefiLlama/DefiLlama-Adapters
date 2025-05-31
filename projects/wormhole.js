const { get } = require("./helper/http");
const url =
  "https://europe-west3-wormhole-message-db-mainnet.cloudfunctions.net/tvl";
let _response;
const { sumSingleBalance } = require("@defillama/sdk/build/generalUtil");

const chainMap = {
  solana: "1",
  ethereum: "2",
  terra: "3",
  bsc: "4",
  polygon: "5",
  avax: "6",
  oasis: "7",
  algorand: "8",
  aurora: "9",
  fantom: "10",
  karura: "11",
  acala: "12",
  klaytn: "13",
  celo: "14",
  near: "15",
  moonbeam: "16",
  terra2: "18",
  injective: "19",
  sui: "21",
  aptos: "22",
  arbitrum: "23",
  optimism: "24",
  xpla: "28",
  base: "30",
};

module.exports = {
  timetravel: false,
  methodology:
    "USD value of native assets currently held by Portal contracts. Token prices sourced from CoinGecko.",
  hallmarks: [
    [1652008803, "UST depeg"],
    ["2022-02-02", "Hacked: Signature Exploit"],
  ],
};

Object.keys(chainMap).forEach((chain) => {
  module.exports[chain] = {
    tvl: async () => {
      if (!_response) _response = get(url);
      const res = await _response;
      const chainId = chainMap[chain];
      if (!(chainId in res.AllTime)) return;

      const balances = {};
      Object.values(res.AllTime[chainId]).map((c) => {
        sumSingleBalance(balances, c.CoinGeckoId, c.Amount, "");
      });

      return balances;
    },
  };
});
// node test.js projects/wormhole.js

const { sumTokens } = require("../helper/chain/ton");
const ADDRESSES = require('../helper/coreAssets.json');

async function tvl(api) {
  const cclContract = "EQAgpWmO8nBUrmfOOldIEmRkLEwV-IIfVAlJsphYswnuL80R";
  const jettonProxyContract = "EQAChAswsPNsU2k3A5ZDO_cfhWknCGS6WMG2Jz15USMwxMdw";

  await sumTokens({ 
    api,
    owners: [cclContract, jettonProxyContract],
    tokens: [ADDRESSES.ton.TON],
    useTonApiForPrices: false
  });

  return api.getBalances();
}

module.exports = {
  methodology: "Tracks TVL across TAC's two main contracts: the Cross-Chain Layer (CCL) contract and the Jetton Proxy contract. Automatically detects and counts all native TON and jetton tokens held in both contracts.",
  timetravel: false,
  ton: {
    tvl,
  },
};

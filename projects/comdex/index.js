const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

// This is the single source of truth for TVL — tracking USDT here avoids
// double-counting CUSD that flows onward into commodity treasuries.
const STABLE_TREASURY = "0xD8875eEf762A6C23f8473E19C896B584BAaF007A";

module.exports = {
  methodology: "TVL is the USDT held in the StableTreasury contract. When users mint CUSD via ComdexStableMarket.buyCUSD(), USDT is deposited 1:1 into the StableTreasury.",
  bsc: {
    tvl: sumTokensExport({tokensAndOwners: [[ADDRESSES.bsc.USDT, STABLE_TREASURY]]}),
  },
};
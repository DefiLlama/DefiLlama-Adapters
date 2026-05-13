const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// BSC USDT — the real backing asset for all CUSD in circulation
const BSC_USDT = ADDRESSES.bsc.USDT;

// StableTreasury: receives USDT when users call ComdexStableMarket.buyCUSD()
// This is the single source of truth for TVL — tracking USDT here avoids
// double-counting CUSD that flows onward into commodity treasuries.
const STABLE_TREASURY = "0xD8875eEf762A6C23f8473E19C896B584BAaF007A";

async function tvl(api) {
  return sumTokens2({ api, tokensAndOwners: [[BSC_USDT, STABLE_TREASURY]] });
}

module.exports = {
  methodology: "TVL is the USDT held in the StableTreasury contract (0xD8875eEf762A6C23f8473E19C896B584BAaF007A). When users mint CUSD via ComdexStableMarket.buyCUSD(), USDT is deposited 1:1 into the StableTreasury. Tracking only this USDT avoids double-counting the CUSD that subsequently flows into commodity treasury contracts.",
  bsc: {
    tvl,
  },
};

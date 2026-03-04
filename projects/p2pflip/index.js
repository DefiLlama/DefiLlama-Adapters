const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const TOKENS = [coreAssets.matchain.MAT, coreAssets.matchain.USDT, coreAssets.matchain.WBNB]
const P2PFLIP = ['0xb71348d7035bC86bbb82471d2963789863E64b60']

module.exports = {
    methodology: "Counts all tokens held by the P2P coinflip game contract including: active flip stakes from ongoing games, pending withdrawals from resolved games awaiting player collection, and session balances from Express Mode deposits. Players can create coin flip challenges by depositing supported tokens (MAT, USDT, WBNB), which are locked in the contract until the flip is resolved or cancelled. Winnings from resolved flips remain in the contract until players withdraw them.",
    matchain: {
      tvl: sumTokensExport({ owners: P2PFLIP, tokens: [...TOKENS, coreAssets.null] }),
    },
  };
  
const ADDRESS = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/sumTokens");
const sdk = require('@defillama/sdk')
const { sumTokensExport: sumBRC20TokensExport } = require("../helper/chain/brc20");

const owner = "0x103dd1184599c7511a3016E0a383E11F84AE7173";
const tokens = {
  ethereum: [ADDRESS.ethereum.USDT],
  bsc: [ADDRESS.ethereum.FDUSD],
};

module.exports = {
  methodology: "Staking tokens via BitStable counts as TVL",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      // Native(BTC)
      sumTokensExport({ owners: ["bc1p36wvtxursam9cq8zmc9ppvsqf9ulefm7grvlfc4tzc5j83rcggsqh6nxw5"] }),
      // BRC20
      sumBRC20TokensExport({
        // Deposit Address
        owners: ["bc1p0uw83vg0h32v7kypyvjn9nextku2h7axjdeefy2ewstevnqffaksjzhrdf"],
        blacklistedTokens: ["BSSB", "DAII"],
      }),
    ]),
    staking: sumBRC20TokensExport({
      // Farm Address
      owners: ["bc1pvngqf24g3hhr5s4ptv472prz576uye8qmagy880ydq5gzpd30pdqtua3rd"],
      blacklistedTokens: ["DAII"],
    }),
  },
};

Object.keys(tokens).map((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owner, tokens: tokens[chain] }),
  };
});

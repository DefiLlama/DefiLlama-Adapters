const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");

// Sushi LP Staking + locking on Mainnet
const STRM_ETH_sushi = "0xb301d7efb4d46528f9cf0e5c86b065fbc9f50e9a";
const LP_staking = "0xc5124896459d3c219be821d1a9146cd51e4bc759";
const LP_locking = "0x4f4f6b428af559db1dbe3cb32e1e3500deffa799";
const STRM = "0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8";
const veSTRM = "0x62ae88697782f474b2537b890733cc15d3e01f1d";

module.exports = {
  ethereum: {
    tvl: () => ({}),
    pool2: staking([LP_staking, LP_locking], [STRM_ETH_sushi]),
    staking: staking(veSTRM, STRM), // vote escrowed STRM, TVL corresponds
  },
  methodology:
    "Instrumental can be LP'ed and LP can be staked or locked (pool2s). Plus STRM itself can be locked against veSTRM (staking). Vaults coming soon.",
};

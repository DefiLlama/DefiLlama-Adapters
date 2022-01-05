const sdk = require("@defillama/sdk");
const { pool2s, pool2 } = require("../helper/pool2");
const { staking } = require("../helper/staking");

// Sushi LP Staking + locking on Mainnet
const SRTM_ETH_sushi = "0xb301d7efb4d46528f9cf0e5c86b065fbc9f50e9a";
const LP_staking = "0xc5124896459d3c219be821d1a9146cd51e4bc759";
const LP_locking = "0x4f4f6b428af559db1dbe3cb32e1e3500deffa799";
const SRTM = "0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8";
const veSRTM = "0x62ae88697782f474b2537b890733cc15d3e01f1d";

module.exports = {
  ethereum: {
    tvl: () => ({}),
    // pool2: pool2(LP_locking, SRTM_ETH_sushi, "ethereum"), // 1M TVL
    // pool2: pool2(LP_staking, SRTM_ETH_sushi, "ethereum"), // 1.13M

    pool2: pool2s([LP_staking, LP_locking], [SRTM_ETH_sushi], "ethereum"),
    staking: staking(veSRTM, SRTM, "ethereum"), // vote escrowed SRTM, TVL corresponds
  },
  methodology:
    "Instrumental can be LP'ed and LP can be staked or locked (pool2s). Plus SRTM itself can be locked against veSRTM (staking). Vaults coming soon.",
};

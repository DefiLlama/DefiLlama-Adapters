// projects/vaultlayer/index.js

const { tvlCoreStaking, tvlBitcoinStaking } = require("./staking");
const { borrowed } = require("./lending");

module.exports = {
  methodology:
    "TVL = BTC & CORE staking via vltCORE on CoreDAO. Borrowed = Bitcoin-backed loans in P2P Lending contracts across supported chains.",
  
  start: 1749621314, // 2025-06-11

  bitcoin: { tvl: tvlBitcoinStaking },
  core: {
    tvl: tvlCoreStaking,
    borrowed
  },  
  ethereum: { borrowed },
  arbitrum: { borrowed },
  bsc: { borrowed },  
  avax: { borrowed },
  base: { borrowed },
  optimism: { borrowed },
  polygon: { borrowed },  
};

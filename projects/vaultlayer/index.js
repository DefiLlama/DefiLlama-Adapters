// projects/vaultlayer/index.js

const { tvlCoreStaking, tvlBitcoinStaking } = require("./staking");
const { borrowed } = require("./lending");

module.exports = {
  misrepresentedTokens: false,
  methodology:
    "TVL = BTC & CORE staking via vltCORE on CoreDAO. Borrowed = Bitcoin-backed loans in P2P Lending contracts across supported chains.",

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

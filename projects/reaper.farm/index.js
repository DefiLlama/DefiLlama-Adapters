const axios = require("axios");
const REAPER_API = "https://2ch9hbg8hh.execute-api.us-east-1.amazonaws.com/dev/api/";

const client = axios.create({
  baseURL: REAPER_API
});

function fetchTvl(chainName) {
  return async () => {
    let tvlMsg = await client.get('/tvls/chains');
    let tvl = 0;
    switch (chainName) {
      case 'fantom':
        tvl = tvlMsg.data.data.find((item) => item.chain_hex === '0xfa').tvl;
        break;
      case 'optimism':
        tvl = tvlMsg.data.data.find((item) => item.chain_hex === '0xa').tvl;
        break;
      case 'arbitrum':
        tvl = tvlMsg.data.data.find((item) => item.chain_hex === '0xa4b1').tvl;
        break;
      case 'bsc':
        tvl = tvlMsg.data.data.find((item) => item.chain_hex === '0x38').tvl;
        break;
      default:
        break;
    }
    return { tether: +tvl };
  }
}

module.exports = {
  misrepresentedTokens: false,
  methodology: `TVL is fetched from the Reaper API`,
  timetravel: false,
  fantom: {
    tvl: fetchTvl('fantom')
  },
  optimism: {
    tvl: fetchTvl('optimism')
  },
  arbitrum: {
    tvl: fetchTvl('arbitrum')
  },
  bsc: {
    tvl: fetchTvl('bsc')
  },
  hallmarks:[
    [1659441956, "$1.7m Exploit"],
  ]
}

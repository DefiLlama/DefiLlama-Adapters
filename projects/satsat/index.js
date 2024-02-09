const axios = require('axios')
const HOST='https://order.satsat.exchange'
const MarketContract = '0x56ed5Ad8DA3ed3b46aE3e6fb28eC653EB93b9436'

async function tvl(_, _b, _cb, { api, }) {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${HOST}/api/queryTokenInfo`,
    data:{"address":"","tokenSymbol":""}
  };
  let { data: { data }} =  await axios.request(config)
  const tokens = data.map(v => v.address);
  return api.sumTokens({ owner: MarketContract, tokens });
}

module.exports = {
  methodology: "All locked tokens includes stable and crypto assets in SatSat marketplace.",
  map: {
    tvl
  }
};

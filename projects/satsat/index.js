const axios = require('axios')
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const HOST='https://order.satsat.exchange'
const MarketContract = '0x56ed5Ad8DA3ed3b46aE3e6fb28eC653EB93b9436'
const request_tvl = async () => {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${HOST}/api/queryTokenInfo`,
    data:{"address":"","tokenSymbol":""}
  };
  let response =  await axios.request(config)
  // console.log(response.data);
  let token_pairs = response.data.data;

  // let listingBalances = (
  //   await sdk.api.abi.multiCall({
  //     calls: token_pairs.map(v => ({ target: v.address, params: MarketContract })),
  //     abi: 'erc20:balanceOf',
  //     chain: "map",
  //   })
  // ).output.map(v => v.output);


  let listingBalance = (await sdk.api.abi.multiCall({
    calls: token_pairs.map(v => ({ target: v.address, params: MarketContract })),
    abi: "erc20:balanceOf",
    chain: "map"
  })).output;


  // console.log(`stakingBalance`,listingBalance)

  let total = 0
  for(let token of listingBalance){
    const  tokenInfo = token_pairs.find(a=>a.address.toLowerCase() == token.input.target.toLowerCase())
    // console.log(2222222,token.output,tokenInfo.lowestListingPrice,tokenInfo.tokenSymbol);
    total = new BigNumber(token.output).div(new BigNumber(10**(18))).multipliedBy(new BigNumber(tokenInfo.lowestListingPrice)).plus(new BigNumber(total));
  }
  // console.log(`total`,total);

  return { tether: total };
};

module.exports = {
  methodology: "All locked tokens includes stable and crypto assets in SatSat marketplace.",
  map: {
    tvl: request_tvl
  }
};

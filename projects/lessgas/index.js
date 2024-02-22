const sdk = require("@defillama/sdk");
const axios = require('axios')

const BigNumber = require("bignumber.js");
const HOST='https://api2.lessgas.xyz'
// const HOST='http://127.0.0.1:9912'
const request_staking = async () => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${HOST}/llama/staking`,
  };
  let response =  await axios.request(config)
  // console.log(response.data);
  let items=response.data.data.result;
  let total=0;
  for (const item of items) {
    try {
      let { output } = await sdk.api.abi.call({
        abi: "erc20:balanceOf",
        target: item[1],
        params: [item[0]],
        chain: "map"
        // block: chainBlocks["arbitrum"],
      });
      console.log(output);
     total =  new BigNumber(total).plus(new BigNumber(output).div(10**18).multipliedBy(new BigNumber(item[2])));
    } catch (e) {
      console.log(e);
    }
  }
  // console.log(items);
  // let result = response.data.data;

  return { tether: total};
};
const request_tvl = async () => {
  // let config = {
  //   method: 'get',
  //   maxBodyLength: Infinity,
  //   url: `${HOST}/llama/tvl`,
  // };
  // //Get supported tokens
  // let response =  await axios.request(config);
  // let tokens = response.data.data.tokens;
  // let total = 0;
  // for (const token of tokens) {
  //
  //   //Obtain the quantity that has been minted
  //   let {output} = await sdk.api.abi.call({
  //     abi: 'erc20:totalSupply',
  //     target: token.contract,
  //     params: [],
  //     chain: "map",
  //     // block: chainBlocks["arbitrum"],
  //   });
  //   console.log(token.symbol,output);
  //   //Accumulate the quantity
  //   total = new BigNumber(output).div(new BigNumber(10**(token.decimals))).multipliedBy(new BigNumber(token.price)).plus(new BigNumber(total));
  //   // console.log(output);
  // }
  // // return { tether: new BigNumber(result.result).multipliedBy(new BigNumber(result.price)) };
  // return { tether: total };
  // return await request_staking();
};

module.exports = {
  methodology: "Get the amount of tokens in lessgas platform",
  map: {
    // tvl: request_tvl,
    tvl: () => ({}),
    staking: request_staking
  }
};

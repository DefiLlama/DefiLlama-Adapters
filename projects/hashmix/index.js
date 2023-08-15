const POOL = "0x587A7eaE9b461ad724391Aa7195210e0547eD11d";
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { get } = require("../helper/http");
const BigNumber = require("bignumber.js");
// const { sdk } = require("@defillama/sdk");

// async function tvl(_, _1, _2, { api }) {
//   const totalBorrows = await api.call({    target: POOL,    abi: "uint256:totalBorrows",  });
//     const totalReserves = await api.call({    target: POOL,    abi: "uint256:totalReserves",  });
//     api.add(nullAddress, totalBorrows)
//     api.add(nullAddress, totalReserves * -1)

//   return sumTokens2({ api, owner: POOL, tokens: [nullAddress]});
// }

async function tvl(_, _1, _2, { api }) {

  let tvl = await get("https://fvm.hashmix.org/fevmapi/tvl");
  // let b = new BigNumber.BigNumber("337036288533616233281756");

  api.add(nullAddress, tvl.data)

  return sumTokens2({ api, owner: POOL, tokens: [nullAddress] });

  // const balances = {};
  // const bal = await sdk.api2.eth.getBalance({ target: POOL, chain: api.chain, decimals: api.decimals });
  // const totalBorrows = await sdk.api2.abi.call({
  //   target: POOL,
  //   abi: "uint256:totalBorrows",
  //   chain: api.chain,
  // });
  // const totalReserves = await sdk.api2.abi.call({
  //   target: POOL,
  //   abi: "uint256:totalReserves",
  //   chain: api.chain,
  // });


  // let b = new BigNumber.BigNumber(bal.output);
  // b = b.plus(new BigNumber.BigNumber(totalBorrows)).minus(new BigNumber.BigNumber(totalReserves));

  // sdk.util.sumSingleBalance(
  //   balances,
  //   nullAddress,
  //   b.toFixed(0),
  //   api.chain
  // );

  // return balances;
}

module.exports = {
  methodology:
    "HashMix FIL Liquid Staking Protocol is a decentralized staking protocol on Filecoin, connecting FIL holders and miners in the ecosystem.",
  filecoin: {
    tvl,
  },
};

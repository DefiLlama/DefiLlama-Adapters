const sdk = require("@defillama/sdk");
// const {get} = require("../helper/http");
const BigNumber = require('bignumber.js');
const POOL = "0x587A7eaE9b461ad724391Aa7195210e0547eD11d";

async function tvl(_, _1, _2, { api }) {

  // let price = await get("https://api.coingecko.com/api/v3/simple/price?ids=filecoin&vs_currencies=usd");
  // let priceFloat = price.filecion.usd;
  
  const balances = {};
  const bal = await sdk.api2.eth.getBalance({target: POOL, chain: api.chain, decimals: api.decimals});
  const totalBorrows = await sdk.api2.abi.call({
    target: POOL,
    abi: "uint256:totalBorrows",
    chain: api.chain,
  });
  const totalReserves = await sdk.api2.abi.call({
    target: POOL,
    abi: "uint256:totalReserves",
    chain: api.chain,
  });

  let b = new BigNumber.BigNumber(bal.output);
  b = b.plus(new BigNumber.BigNumber(totalBorrows)).minus(new BigNumber.BigNumber(totalReserves));

  sdk.util.sumSingleBalance(
    balances,
    "filecoin",
    b.toFixed(0),
    api.chain
  );

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "HashMix FIL Liquid Staking Protocol is a decentralized staking protocol on Filecoin, connecting FIL holders and miners in the ecosystem.",
  filecoin: {
    tvl,
  },
};

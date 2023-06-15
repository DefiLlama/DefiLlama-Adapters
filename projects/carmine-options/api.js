// https://www.starknetjs.com/docs/API/contract

const { call, multiCall, parseAddress, number, sumTokens, } = require("../helper/chain/starknet");
const abi = require("./abi");

const amm =
  "0x076dbabc4293db346b0a56b29b6ea9fe18e93742c73f12348c8747ecfc1050aa";

async function tvl(_, _1, _2, { api }) {

  let lpTokens = await call({
    abi: abi.get_all_lptoken_addresses,
    target: amm,
  })
  lpTokens = number.bigNumberishArrayToHexadecimalStringArray(lpTokens.array.toString().split(','))
  let underlyings = await multiCall({
    abi: abi.get_underlying_token_address,
    target: amm,
    calls: lpTokens.map((lpToken) => ({
      params: [parseAddress(lpToken)],
    })),
  });
  return sumTokens({ owner: amm, tokens: underlyings.map(parseAddress), api, });
}

module.exports = {
  methodology: 'Sums the unlocked capital and position of each pool.',
  starknet: {
    tvl,
  },
};

const { call, multiCall, number, sumTokens, } = require("../helper/chain/starknet");
const abi = require("./abi");

const legacyAmm = "0x076dbabc4293db346b0a56b29b6ea9fe18e93742c73f12348c8747ecfc1050aa";
const amm = "0x047472e6755afc57ada9550b6a3ac93129cc4b5f98f51c73e0644d129fd208d9";

async function tvl(api) {
  let legacyLpTokens = await call({ abi: abi.get_all_lptoken_addresses, target: legacyAmm, })
  let newLpTokens = await call({ abi: abi.get_all_lptoken_addresses, target: amm, })
  legacyLpTokens = number.bigNumberishArrayToHexadecimalStringArray(legacyLpTokens.array.toString().split(','))
  newLpTokens = number.bigNumberishArrayToHexadecimalStringArray(newLpTokens.array.toString().split(','))
  const legacyUnderlyings = await multiCall({ abi: abi.get_underlying_token_address, target: legacyAmm, calls: legacyLpTokens, })
  const underlyings = await multiCall({ abi: abi.get_underlying_token_address, target: amm, calls: newLpTokens, })
  const owners = [amm, legacyAmm];
  const tokens = [...legacyUnderlyings, ...underlyings]
  return sumTokens({ owners, tokens, api, })
}

module.exports = {
  methodology: 'Sums the unlocked capital and position of each pool.',
  starknet: {
    tvl,
  },
};

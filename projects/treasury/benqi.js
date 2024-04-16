const { getCompoundV2Tvl } = require("../helper/compound");
const { stakings } = require("../helper/staking");
const { sumTokens } = require("../helper/sumTokens");
const { nullAddress } = require("../helper/treasury");

const treasury = "0x142eB2ed775e6d497aa8D03A2151D016bbfE7Fc2";
const treasury2 = "0x9d6ef2445fcc41b0d08865f0a7839490cc58a7b7";
const owners = [treasury, treasury2]
const qi = "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5";

async function tvl(api){
  const balances = await getCompoundV2Tvl("0x486af39519b4dc9a7fccd318217352830e8ad9b4", "avax", undefined, undefined, undefined, false, undefined, {
    abis:{
      getCash: {"constant":true,"inputs":[],"name":"totalReserves","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}
    }
  })()
  return sumTokens({
    balances,
    api,
    owners,
    tokens: [nullAddress]
  })
}

module.exports = {
  avax:{
    ownTokens: stakings(owners, qi),
    tvl
  }
}

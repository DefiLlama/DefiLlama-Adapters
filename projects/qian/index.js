const abi = require("./abi");

const AssetAddress = "0x6a2469944d3F0AA54531DfA6dCB4350F4A150b67";
const EnvAddress = "0x3719C6ff935623A7B125952df5D849ef53B08cAc";

async function tvl(api) {
  const tokens= await api.call({  abi: abi.env.tokens, target: EnvAddress})
  return api.sumTokens({ owner: AssetAddress, tokens })
}

module.exports = {
  start: 1513566671, // 2020/10/21 6:34:47 (+UTC)
  ethereum: { tvl },
};

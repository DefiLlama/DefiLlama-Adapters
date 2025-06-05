const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

const kanvas = "0xe005097ad7eea379ce404011eef68359b052cd0a";
const stakingAddress = "0x34d2Cfb257cCf7EFDC41DB9a824ac314da80Bae8";
const artStudio = "0xf15Bf479A5711f9411595C6289a9e7C36F24ad2F";

async function tvl(api) {
  const tokens = await api.call({ abi: abi.tokenList, target: artStudio, })
  const bals = (await api.multiCall({ abi: abi.tokenParameters, calls: tokens, target: artStudio, })).map(i => i.totalTokens)
  api.add(tokens, bals)
  return sumTokens2({ api, tokens, owners: [artStudio], resolveLP: true, })
}

async function pool2() {
  return {}
}

module.exports = {
  deadFrom: '2023-12-01',
  kava: {
    tvl,
    pool2,
    staking: staking(stakingAddress, kanvas)
  }
}
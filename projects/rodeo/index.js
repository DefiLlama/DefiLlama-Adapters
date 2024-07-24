const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const investorHelper = "0x6f456005A7CfBF0228Ca98358f60E6AE1d347E18";
const pools = [
  "0x0032F5E1520a66C6E572e96A11fBF54aea26f9bE", // usdc-v1
];

async function borrowed(api) {
  const assets = await api.multiCall({  abi: 'address:asset', calls: pools})
  const data = await api.call({  abi: abi.peekPools, target: investorHelper, params: [pools]})
  data[3].forEach((v, i) => api.add(assets[i], v))
}

async function tvl(api) {
  const assets = await api.multiCall({  abi: 'address:asset', calls: pools}) 
  return sumTokens2({ api, tokensAndOwners2: [assets, pools]})
}

module.exports = {
  arbitrum: { tvl, borrowed, },
  methodology: `The TVL shown is the result of subtracting the borrow from the supply for each Rodeo lending pool`,
  hallmarks: [
    [Math.floor(new Date('2023-07-11')/1e3), 'Protocol was exploited'],
  ],
};

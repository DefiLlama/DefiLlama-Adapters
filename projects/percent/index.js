const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { stakings } = require("../helper/staking");
const { compoundExports2 } = require("../helper/compound");

const comptroller = "0xf47dD16553A934064509C40DC5466BBfB999528B";

const pool2Contract = "0x23b53026187626Ed8488e119767ACB2Fe5F8de4e";
const lpOfPool2 = "0xEB85B2E12320a123d447Ca0dA26B49E666b799dB";

const pctPoolContracts = [
  "0x5859D111210dd9FE6F11502b65C1BF26a46018d2",
  "0xa40d04a73d6E00049d8A72623Ef8b75879059F70",
  "0x0190bF688fF57B935e99487AaceBAccf450C5D4f",
  "0xed41F2b444D72648647d6f5a124Ad15574963706",
  "0xfAe0ADb2d30E2a63730AC927E4e15e96D69B4aDd",
  "0x8124502fB129eB1B0052725CfD126e8EB0975ab1",
  "0xf49A20407b92332704B5FE4942c95D7d134b843b",
];

const lpOfPctPools = [
  "0xe010fcda8894c16a8acfef7b37741a760faeddc4",
  "0xc48b8329d47ae8fd504c0b81cf8435486380e858",
  "0xEe9A6009B926645D33E10Ee5577E9C8D3C95C165",
  "0xe969991ce475bcf817e01e1aad4687da7e1d6f83",
  "0x99e582374015c1d2f3c0f98d0763b4b1145772b7",
  "0x41284a88d970d3552a26fae680692ed40b34010c",
  "0xe867be952ee17d2d294f2de62b13b9f4af521e9a",
];

const stakingContract = "0x894CC200DDc79292c1BBc673706903F83Ff9d787";
const PCT = "0xbc16da9df0a22f01a16bc0620a27e7d6d6488550";

const stakingContracts = pctPoolContracts.concat([stakingContract, comptroller])

async function resolveBalancers({ balances = {}, toa, api }) {
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: toa.map(i => ({ params: i[1], target: i[0] })) })
  const supply = await api.multiCall({ abi: abi.totalSupply, calls: toa.map(i => i[0]) })
  const ratio = bals.map((v, i) => v / supply[i])
  const tokens = await api.multiCall({ abi: abi.getCurrentTokens, calls: toa.map(i => i[0]) })
  await Promise.all(tokens.map(async (t, i) => {
    const owner = toa[i][0]
    const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: t.map(j => ({ target: j, params: owner })) })
    bals.forEach((bal, j) => {
      const token = t[j]
      sdk.util.sumSingleBalance(balances, token, bal * ratio[i], api.chain)
    })
  }))
  return balances
}

async function pool2(api) {
  return resolveBalancers({ toa: [[lpOfPool2, pool2Contract]], api })
}

async function ethTvl(api) {
  const toa = []
  for (let i = 0; i < pctPoolContracts.length; i++)
    toa.push([lpOfPctPools[i], pctPoolContracts[i]])

  return resolveBalancers({ api, toa });
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(stakingContracts, PCT),
    pool2: pool2,
    ...compoundExports2({ comptroller, cether: '0x45f157b3d3d7c415a0e40012d64465e3a0402c64' }),

  },
  methodology:
    "Same as compound, we get all the liquidity and the borrowed part on the lending markets",
};

module.exports.ethereum.tvl = sdk.util.sumChainTvls([module.exports.ethereum.tvl, ethTvl])
module.exports.ethereum.tvl = ethTvl
module.exports.ethereum.borrowed = () => ({})
const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { default: BigNumber } = require("bignumber.js");
const { stakings } = require("../helper/staking");
const { getCompoundV2Tvl } = require("../helper/compound");

const comptroller = "0xf47dD16553A934064509C40DC5466BBfB999528B";
const pETH = "0x45F157b3d3d7C415a0e40012D64465e3a0402C64";
const pETHEquivalent = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

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

const calc = async (balances, poolContract, lpToken) => {
  const balanceLPofPool2 = (
    await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: lpToken,
      params: poolContract,
    })
  ).output;

  const tokensOfLP = (
    await sdk.api.abi.call({
      abi: abi.getCurrentTokens,
      target: lpToken,
    })
  ).output;

  for (const token of tokensOfLP) {
    const getBalance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: token,
        params: lpToken,
      })
    ).output;

    const totalSupply = (
      await sdk.api.abi.call({
        abi: abi.totalSupply,
        target: lpToken,
      })
    ).output;

    sdk.util.sumSingleBalance(
      balances,
      token,
      BigNumber(getBalance).times(balanceLPofPool2).div(totalSupply).toFixed(0)
    );
  }
};

async function pool2() {
  const balances = {};

  await calc(balances, pool2Contract, lpOfPool2);

  return balances;
}

async function ethTvl() {
  const balances = {};

  for (let i = 0; i < pctPoolContracts.length; i++) {
    await calc(balances, pctPoolContracts[i], lpOfPctPools[i]);
  }

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(stakingContracts, PCT),
    pool2: pool2,
    borrowed: getCompoundV2Tvl(
      comptroller,
      "ethereum",
      (addr) => addr,
      pETH,
      pETHEquivalent,
      true
    ),
    tvl: sdk.util.sumChainTvls([
      getCompoundV2Tvl(
        comptroller,
        "ethereum",
        (addr) => addr,
        pETH,
        pETHEquivalent
      ),
      ethTvl,
    ]),
  },

  methodology:
    "Same as compound, we get all the liquidity and the borrowed part on the lending markets",
};

const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { pool2, pool2s } = require("../helper/pool2");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const {
  transformPolygonAddress,
  transformFantomAddress,
} = require("../helper/portedTokens");

const poolUSDC = "0xa0F395aD5df1Fceb319e162CCf1Ef6645dE8508f"; // same address for all chains
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USDC_polygon = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const USDC_fantom = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";

const stakingPool2Contracts = [
  "0x4e5D8794f08F2792DC51016d0a4b9A205cAFc63A", //same dei-deus for all chains
  "0x4C48f1421F62d923d9130834135FB4A58E2F4298", //same deus-weth except polygon -> deus-wmatic
];
const DEI_DEUS_UNIV2 = "0xd6dd359B8C9d18CCB3FE8627060F88D1776d2993";
const DEUS_WETH_UNIV2 = "0x367E2D443988E4b222FBFdAFDb35eeB7ddA9FBB7";

const DEI_DEUS_UNIV2_polygon = "0x2Bc3ce6D7cfc0B476E60aDaA1B27DE76DB95EE4e";
const DEUS_WMATIC_UNIV2_polygon = "0x6152943b506211ce1FA872702a1b0bc594Cfa2d2";

const DEI_DEUS_SPIRITLP_fantom = "0xdDC92fcEd95e913728CBc8f197A4E058062Bd4b6";

const stakingPool2Contracts_fantom = [
  "0x372b584D4f5Dc77256b18e34692B0881451bf25E", //farm dei-usdc
  "0x3CB9ae281E511759832a074A92634d2486E6a886", //farm deus-wftm
];

const DEI_USDC_SPIRITLP_fantom = "0x8eFD36aA4Afa9F4E157bec759F1744A7FeBaEA0e";
const DEUS_WFTM_SPIRITLP_fantom = "0x2599Eba5fD1e49F294C76D034557948034d6C96E";

const stakingPool2Contract = "0xa78Ea447ce5AA4669A5f0cD8D27bF5883E1Bf20f"; // for all chains
const DEI_USDC_UNIV2 = "0xD4F9134ba896FB6901CD6A5EA4EEB683eb1c15c6"; // dei-usdc for polygon
const DEI3CRV = "0x6870f9b4dd5d34c7fc53d0d85d9dbd1aab339bf7";
const DEI = "0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3";
const CRV3 = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
const DEUS = "0xde5ed76e7c05ec5e4572cfc88d1acea165109e44";

async function Pool2() {
  const balances = {};

  const totalSupply_slp = (
    await sdk.api.erc20.totalSupply({
      target: DEI3CRV,
    })
  ).output;

  const balance_slp = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: DEI3CRV,
      params: stakingPool2Contract,
    })
  ).output;

  const underlyingsBalance = (
    await sdk.api.abi.multiCall({
      calls: [DEI, CRV3].map((token) => ({
        target: token,
        params: DEI3CRV,
      })),
      abi: 'erc20:balanceOf',
    })
  ).output;

  underlyingsBalance.forEach((call) => {
    const underlyingSetBalance = BigNumber(call.output)
      .times(balance_slp)
      .div(totalSupply_slp);

    sdk.util.sumSingleBalance(
      balances,
      call.input.target,
      underlyingSetBalance.toFixed(0)
    );
  });

  return balances;
}

async function ethTvl() {
  const balances = {};

  await sumTokensAndLPsSharedOwners(balances, [[USDC, false]], [poolUSDC]);

  return balances;
}

async function polygonTvl(timestamp, chainBlocks) {
  const balances = {};

  const transformAddress = await transformPolygonAddress();
  await sumTokensAndLPsSharedOwners(
    balances,
    [[USDC_polygon, false]],
    [poolUSDC],
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  return balances;
}

async function fantomTvl(timestamp, chainBlocks) {
  const balances = {};

  const transformAddress = await transformFantomAddress();
  await sumTokensAndLPsSharedOwners(
    balances,
    [[USDC_fantom, false]],
    [poolUSDC],
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
    pool2: sdk.util.sumChainTvls([
      Pool2,
      pool2s(stakingPool2Contracts, [DEI_DEUS_UNIV2, DEUS_WETH_UNIV2]),
    ]),
  },
  polygon: {
    tvl: polygonTvl,
    pool2: sdk.util.sumChainTvls([
      pool2s(
        stakingPool2Contracts,
        [DEI_DEUS_UNIV2_polygon, DEUS_WMATIC_UNIV2_polygon],
        "polygon"
      ),
      pool2(stakingPool2Contract, DEI_USDC_UNIV2, "polygon"),
    ]),
  },
  fantom: {
    tvl: fantomTvl,
    pool2: sdk.util.sumChainTvls([
      pool2(
        stakingPool2Contracts[0],
        DEI_DEUS_SPIRITLP_fantom,
        "fantom",
        (id) => id
      ),
      pool2s(
        stakingPool2Contracts_fantom,
        [DEI_USDC_SPIRITLP_fantom, DEUS_WFTM_SPIRITLP_fantom],
        "fantom"
      ),
    ]),
  },
  methodology:
    "Counts liquidty of Minted assets(USDC) through PoolUSDC Contracts; and Pool2s from Farm seccions",
};

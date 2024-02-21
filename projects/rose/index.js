const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const abi = require("./abi.json");

// pool addresses
const stablesPool = "0xc90dB0d8713414d78523436dC347419164544A3f";
const fraxPool = "0xa34315F1ef49392387Dd143f4578083A9Bd33E94";
const atustPool = "0x8fe44f5cce02D5BE44e3446bBc2e8132958d22B8";
const maiPool = "0x65a761136815B45A9d78d9781d22d47247B49D23";
// const busdPool = "0xD6cb7Bb7D63f636d1cA72A1D3ed6f7F67678068a";
const rusdPool = "0x79B0a67a4045A7a8DC04b17456F4fe15339cBA34";

// token addresses
const DAI = "0xe3520349F477A5F6EB06107066048508498A291b";
const USDC = ADDRESSES.aurora.USDC_e;
const USDT = ADDRESSES.aurora.USDT_e;
const FRAX = ADDRESSES.aurora.FRAX;
const UST = "0x5ce9F0B6AFb36135b5ddBF11705cEB65E634A9dC";
const MAI = ADDRESSES.moonbeam.MAI;
// const BUSD = "0x5C92A4A7f59A9484AFD79DbE251AD2380E589783";
const RUSD = "0x19cc40283B057D6608C22F1D20F17e16C245642E";
const ROSE = "0xdcD6D4e2B3e1D1E1E6Fa8C21C8A323DcbecfF970";
const STROSE = "0xe23d2289FBca7De725DC21a13fC096787A85e16F";
const NEAR = ADDRESSES.aurora.NEAR;
const WETH = "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB";
const WBTC = "0xf4eb217ba2454613b15dbdea6e5f22276410e89e";

// garden addresses
const gardenNear = "0x64C922E3824ab40cbbEdd6C8092d148C283d3D3D";
const gardenUsdc = "0xfbAF3eBF228eB712b1267285787e51aDd70086bB";
const gardenUsdt = "0x0F44fCD177098Cb2B063B50f6C62e4F1E1f9d596";
const gardenWeth = "0x084355FDd5fcfd55d60C5B8626756a6906576f13";
const gardenAtust = "0xe8F7F08D50e12145Cb722cfF861e6A9b43EADBA1";
const gardenWbtc = "0x6bA5B45149996597d96e6dB19E4E1eFA81a6df97";

const VASE = "0xee793001Ce9Fa988712B15a59CCf5dC7d54b22FF";

// pool to underlying tokens map
const poolToTokensMap = {
  [stablesPool]: [DAI, USDC, USDT],
  [fraxPool]: [FRAX],
  [atustPool]: [UST],
  [maiPool]: [MAI],
  // [busdPool]: [BUSD],
  [rusdPool]: [RUSD],
};

// garden to underlying tokens map
const gardenToTokensMap = {
  [gardenNear]: [NEAR],
  [gardenUsdc]: [USDC],
  [gardenUsdt]: [USDT],
  [gardenWeth]: [WETH],
  [gardenAtust]: [UST],
  [gardenWbtc]: [WBTC],
};

// tvl calculation
const tvl = async (timestamp, ethBlock, chainBlock) => {
  let tvl = {};
  let calls = [];

  const block = chainBlock.aurora;

  Object.entries(poolToTokensMap).forEach(([poolAddress, poolTokens]) => {
    poolTokens.forEach((_, tokenIndex) => {
      calls.push({
        target: poolAddress,
        params: tokenIndex,
      });
    });
  });

  // pool balances
  const balances = await sdk.api.abi.multiCall({
    calls: calls,
    block,
    abi: abi.balances,
    chain: "aurora",
  });

  balances.output.forEach((res) => {
    const amount = res.output;
    const poolAddress = res.input.target;
    const tokenAddress = poolToTokensMap[poolAddress][res.input.params[0]];
    sdk.util.sumSingleBalance(tvl, `aurora:${tokenAddress}`, amount);
  });

  // unsupported stablecoin tokens
  tvl["FRAX"] = new BigNumber(tvl[`aurora:${FRAX}`])
    .div(new BigNumber(10).pow(18))
    .toNumber();
  delete tvl[`aurora:${FRAX}`];
  tvl["RUSD"] = new BigNumber(tvl[`aurora:${RUSD}`])
    .div(new BigNumber(10).pow(18))
    .toNumber();
  delete tvl[`aurora:${RUSD}`];

  // format calls to vase for collateral
  calls = [];
  Object.entries(gardenToTokensMap).forEach(([gardenAddress, gardenTokens]) => {
    gardenTokens.forEach((gardenToken) => {
      calls.push({
        target: VASE,
        params: [gardenToken, gardenAddress],
      });
    });
  });

  const vaseCollateralBalances = await sdk.api.abi.multiCall({
    calls: calls,
    block,
    abi: abi.balanceOf,
    chain: "aurora",
  });

  vaseCollateralBalances.output.forEach((res) => {
    const amount = res.output;
    const tokenAddress = res.input.params[0];
    sdk.util.sumSingleBalance(tvl, `aurora:${tokenAddress}`, amount);
  });

  return tvl;
};

// staking calculation
const staking = async (timestamp, ethBlock, chainBlock) => {
  const balances = {};
  const stRoseTvl = await sdk.api.erc20.balanceOf({
    target: ROSE,
    owner: STROSE,
    chain: "aurora",
    block: chainBlock.aurora,
  });

  sdk.util.sumSingleBalance(balances, `aurora:${ROSE}`, stRoseTvl.output);
  return balances;
};

const borrowed = async (timestamp, ethBlock, chainBlock) => {
  const calls = [];
  Object.entries(gardenToTokensMap).forEach(([gardenAddress, gardenTokens]) => {
    gardenTokens.forEach((_) => {
      calls.push({
        target: gardenAddress,
        params: [],
      });
    });
  });

  const borrowedAmounts = await sdk.api.abi.multiCall({
    calls: calls,
    block: chainBlock.aurora,
    abi: abi.totalBorrow,
    chain: "aurora",
  });

  borrowedAmounts.output.forEach((res) => {
    const amount = res.output[0];
    sdk.util.sumSingleBalance(borrowed, `aurora:${RUSD}`, amount);
  });

  borrowed["RUSD"] = new BigNumber(borrowed[`aurora:${RUSD}`])
    .div(new BigNumber(10).pow(18))
    .toNumber();
  delete borrowed[`aurora:${RUSD}`];

  return borrowed;
};

module.exports = {
  methodology:
    "TVL is computed as the sum of the underlying token balances on all Rose liquidity pools. Staking accounts for total ROSE token staked. Borrowed accounts for debt in RUSD for all open collateralized debt positions.",
  aurora: {
    tvl,
    staking,
    borrowed
  },
};

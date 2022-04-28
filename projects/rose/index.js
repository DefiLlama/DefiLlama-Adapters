const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const _ = require("underscore");
const poolAbi = require("./poolAbi.json");

// pool/token addresses
const stablesPool = "0xc90dB0d8713414d78523436dC347419164544A3f";
const fraxPool = "0xa34315F1ef49392387Dd143f4578083A9Bd33E94";
const atustPool = "0x8fe44f5cce02D5BE44e3446bBc2e8132958d22B8";
const DAI = "0xe3520349F477A5F6EB06107066048508498A291b";
const USDC = "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802";
const USDT = "0x4988a896b1227218e4A686fdE5EabdcAbd91571f";
const FRAX = "0xda2585430fef327ad8ee44af8f1f989a2a91a3d2";
const UST = "0x5ce9F0B6AFb36135b5ddBF11705cEB65E634A9dC";
const ROSE = "0xdcD6D4e2B3e1D1E1E6Fa8C21C8A323DcbecfF970";
const STROSE = "0xe23d2289FBca7De725DC21a13fC096787A85e16F";

// pool to underlying tokens map
const poolToTokensMap = {
  [stablesPool]: [DAI, USDC, USDT],
  [fraxPool]: [FRAX],
  [atustPool]: [UST],
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
    abi: poolAbi,
    chain: "aurora",
  });

  _.each(balances.output, (res) => {
    const amount = res.output;
    const poolAddress = res.input.target;
    const tokenAddress = poolToTokensMap[poolAddress][res.input.params[0]];
    sdk.util.sumSingleBalance(tvl, `aurora:${tokenAddress}`, amount);
  });

  // frax on aurora isn't on coingecko
  tvl["FRAX"] = new BigNumber(tvl[`aurora:${FRAX}`])
    .div(new BigNumber(10).pow(18))
    .toNumber();
  delete tvl[`aurora:${FRAX}`];
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

module.exports = {
  methodology:
    "TVL is computed as the sum of the underlying token balances on all Rose liquidity pools. Staking accounts for total ROSE token staked.",
  aurora: {
    tvl,
    staking,
  },
};

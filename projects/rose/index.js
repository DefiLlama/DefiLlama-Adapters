const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const _ = require("underscore");
const poolAbi = require("./poolAbi.json");

// pool/token addresses
const stablesPool = "0xc90dB0d8713414d78523436dC347419164544A3f";
const fraxPool = "0xa34315F1ef49392387Dd143f4578083A9Bd33E94"
const atustPool = "0x8fe44f5cce02D5BE44e3446bBc2e8132958d22B8"
const DAI = {
  address: "0xe3520349F477A5F6EB06107066048508498A291b",
  decimals: 18,
  symbol: "dai",
};
const USDC = {
  address: "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802",
  decimals: 6,
  symbol: "usd-coin",
};
const USDT = {
  address: "0x4988a896b1227218e4A686fdE5EabdcAbd91571f",
  decimals: 6,
  symbol: "tether",
};
const FRAX = {
  address: "0xda2585430fef327ad8ee44af8f1f989a2a91a3d2",
  decimals: 18,
  symbol: "frax",
};
const UST = {
  address: "0x5ce9F0B6AFb36135b5ddBF11705cEB65E634A9dC",
  decimals: 18,
  symbol: "terrausd",
};

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
    const token = poolToTokensMap[poolAddress][res.input.params[0]];
    tvl[token.symbol] = new BigNumber(amount).div(new BigNumber(10).pow(token.decimals)).toNumber()
  });

  return tvl;
};

module.exports = {
  aurora: {
    tvl,
  },
  tvl: sdk.util.sumChainTvls([tvl]),
};

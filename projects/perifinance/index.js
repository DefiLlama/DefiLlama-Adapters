const { getLiquityTvl } = require("../helper/liquity");
const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");

const BigNumber = require("bignumber.js");

const ethereum = "ethereum";
const polygon = "polygon";
const bsc = "bsc";

const pUSDContractEther = "0x0A51952e61a990E585316cAA3d6D15C8d3e55976";
const pUSDContractPolygon = "0xA590C980050d934c046920f8a9e0d9567536eDce";
const pUSDContractBSC = "0xc9363d559D2e6DCAc6955A00B47d28326e07Cf07";

const tokenKey = "usd-coin";

const erc20TotalSupplyByChain = async (tokenAddress, chain) => {
  const { output: decimals } = await sdk.api.erc20.decimals(
    tokenAddress,
    chain
  );

  const { output: totalSupply } = await sdk.api.erc20.totalSupply({
    target: tokenAddress,
    chain,
    decimals,
  });

  return totalSupply;
};

const getTVL = (totalSupply) => {
  return BigNumber(totalSupply).times(1e18).times(4);
};

const tvlByChain = (chain) => async (timestamp, block) => {
  const pUSDContract =
    chain === ethereum
      ? pUSDContractEther
      : chain === bsc
      ? pUSDContractBSC
      : chain === polygon
      ? pUSDContractPolygon
      : null;

  const pUSDTotalSupply = await erc20TotalSupplyByChain(pUSDContract, chain);

  const tvl = getTVL(pUSDTotalSupply);

  // toFixed(0) just converts the numbers into strings
  return {
    [tokenKey]: tvl.toFixed(0),
  };
};

async function tvl(timestamp, block) {
  const tvlArr = [ethereum, bsc, polygon].map((chain) =>
    tvlByChain(chain)(timestamp, block)
  );

  const fetchedTvlArr = await Promise.all(tvlArr);

  const tvl = fetchedTvlArr.reduce(
    (prev, { [tokenKey]: tvl }) => BigNumber(tvl).plus(prev),
    BigNumber(0)
  );

  console.log("totalValueLocked : ", tvl.toFixed(0));

  // toFixed(0) just converts the numbers into strings
  return {
    [tokenKey]: tvl.toFixed(0),
  };
}

module.exports = {
  ethereum: {
    tvl: tvlByChain(ethereum),
  },
  bsc: {
    tvl: tvlByChain(bsc),
  },
  polygon: {
    tvl: tvlByChain(polygon),
  },
  tvl,
};

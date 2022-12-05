const { sumTokens } = require("../helper/unwrapLPs.js");
const { unwrapTroves } = require("../helper/unwrapLPs.js");
const { staking } = require("../helper/staking");

const chain = "ethereum";

const eth = {
  dai: "0x6b175474e89094c44da98b954eedeac495271d0f",
  maha: "0xb4d930279552397bba2ee473229f89ec245bc365",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  arth: "0x8CC0F052fff7eaD7f2EdCCcaC895502E884a8a71",
  crv3: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
  usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",

  mahax: "0xbdd8f4daf71c2cb16cce7e54bb81ef3cfcf5aacb",

  daiMahaPool: "0x8cb8f052e7337573cd59d33bb67b2acbb65e9876",
  arthUsdcPool: "0x031a1d307C91fbDE01005Ec2Ebc5Fcb03b6f80aB",
  arthMahaPool: "0xC5Ee69662e7EF79e503be9D54C237d5aafaC305d",
  arth3crvPool: "0x96f34Bb82fcA57e475e6ad218b0dd0C5c78DF423",
  arthWethPool: "0xE7cDba5e9b0D5E044AaB795cd3D659aAc8dB869B",
};

Object.keys(eth).forEach((k) => (eth[k] = eth[k].toLowerCase()));

async function pool2(_, block) {
  const balances = {};

  const tokensAndOwners = [
    // ARTH/CRV - Curve
    // https://curve.fi/#/ethereum/pools/factory-crypto-142/swap
    // Stablecoin part of the pool
    [eth.arth, eth.arth3crvPool],
    [eth.crv3, eth.arth3crvPool],

    // ARTH/ETH Uniswap 1%
    // https://info.uniswap.org/#/pools/0xe7cdba5e9b0d5e044aab795cd3d659aac8db869b
    // Stablecoin part of the pool
    [eth.arth, eth.arthWethPool],
    [eth.weth, eth.arthWethPool],

    // ARTH/MAHA Uniswap 1%
    // https://info.uniswap.org/#/pools/0xc5ee69662e7ef79e503be9d54c237d5aafac305d
    // Stablecoin & Governance token part of the pool
    [eth.arth, eth.arthMahaPool],
    [eth.maha, eth.arthMahaPool],

    // ARTH/USDC Uniswap 1%
    // https://info.uniswap.org/#/pools/0x031a1d307c91fbde01005ec2ebc5fcb03b6f80ab
    // Stablecoin part of the pool
    [eth.arth, eth.arthUsdcPool],
    [eth.usdc, eth.arthUsdcPool],

    // DAI/MAHA Uniswap 1%
    // https://info.uniswap.org/#/pools/0x8cb8f052e7337573cd59d33bb67b2acbb65e9876
    // Governance part of the pool
    [eth.dai, eth.daiMahaPool],
    [eth.maha, eth.daiMahaPool],
  ];

  return sumTokens(balances, tokensAndOwners, block, chain);
}

async function tvl(_, block) {
  const balances = {};
  const troves = [
    "0xd3761e54826837b8bbd6ef0a278d5b647b807583", // ETH Trove
  ];
  await unwrapTroves({ balances, chain, block, troves });

  return balances;
}

module.exports = {
  staking: staking(eth.mahax, eth.maha),
  pool2,
  tvl,
};

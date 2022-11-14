const { balanceOf, totalSupply } = require("@defillama/sdk/build/erc20");
const sdk = require('@defillama/sdk');
const { unwrapTroves, unwrapUniswapV3NFTs } = require("../helper/unwrapLPs.js");
const { staking } = require("../helper/staking");

const chain = "ethereum";

const eth = {
  ethMahaSLP: "0xB73160F333b563f0B8a0bcf1a25ac7578A10DE96",
  ethMahaSLP2: "0xC0897d6Ba893E31F42F658eeAD777AA15B8f824d",
  ethMahaSushiStaking: "0x20257283d7B8Aa42FC00bcc3567e756De1E7BF5a",
  maha: "0xb4d930279552397bba2ee473229f89ec245bc365",
  mahax: "0xbdd8f4daf71c2cb16cce7e54bb81ef3cfcf5aacb",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  frax: "0x853d955acef822db058eb8505911ed77f175b99e",
  arth: "0x8CC0F052fff7eaD7f2EdCCcaC895502E884a8a71",
  vecrv: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
  unisawapV3Pool: '0xC5Ee69662e7EF79e503be9D54C237d5aafaC305d',
  arth3crvPool: "0x96f34Bb82fcA57e475e6ad218b0dd0C5c78DF423",
  arthWethPool: "0xE7cDba5e9b0D5E044AaB795cd3D659aAc8dB869B",
  arthMahaV3Gauge: "0x48165A4b84e00347C4f9a13b6D0aD8f7aE290bB8",
  arthUsdcV3Gauge: "0x174327F7B7A624a87bd47b5d7e1899e3562646DF",
  arthEthV3Gauge: "",

  "arth.usd": "0x973F054eDBECD287209c36A2651094fA52F99a71",
};

Object.keys(eth).forEach((k) => (eth[k] = eth[k].toLowerCase()));

async function pool2(_, block) {
  const balances = {};

  // uniswap v3 gauge staking
  const v3poolStakers = [eth.arthMahaV3Gauge, eth.arthUsdcV3Gauge];
  await unwrapUniswapV3NFTs({ balances, owners: v3poolStakers, chain, block });

  const mahauniswapV3Bal = await getBalance(
    eth["maha"],
    eth["unisawapV3Pool"],
    block
  );
  sdk.util.sumSingleBalance(balances, eth["maha"], mahauniswapV3Bal);

  const arthuniswapV3Bal = await getBalance(
    eth["arth"],
    eth["unisawapV3Pool"],
    block
  );
  sdk.util.sumSingleBalance(balances, eth["arth"], arthuniswapV3Bal);

  const arthV3Bal = await getBalance(
    eth["arth"],
    eth["arth3crvPool"],
    block
  );
  sdk.util.sumSingleBalance(balances, eth["arth"], arthV3Bal);

  const v3CrvBal = await getBalance(
    eth["vecrv"],
    eth["arth3crvPool"],
    block
  );
  sdk.util.sumSingleBalance(balances, eth["vecrv"], v3CrvBal);

  const valueCoinBal = await getTotalSupply(
    eth["arth"],
    block
  )
  sdk.util.sumSingleBalance(balances, eth["arth"], valueCoinBal);

  const arth2Bal = await getBalance(
    eth["arth"],
    eth["arthWethPool"],
    block
  );
  sdk.util.sumSingleBalance(balances, eth["arth"], arth2Bal);

  const wethBal = await getBalance(
    eth["weth"],
    eth["arthWethPool"],
    block
  );
  sdk.util.sumSingleBalance(balances, eth["weth"], wethBal);

  return balances;

}

const getBalance = async (target, owner, block) => {
  return (
    await balanceOf({
      target: target,
      owner: owner,
      block,
      chain,
    })
  ).output;
};

const getTotalSupply = async (target, block) => {
  return (
    await totalSupply({
      target: target,
      block,
      chain,
    })
  ).output;
};

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

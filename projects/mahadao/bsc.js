const { balanceOf, totalSupply } = require("@defillama/sdk/build/erc20");
const { sumTokens } = require("../helper/unwrapLPs.js");
const BigNumber = require("bignumber.js");
const getEntireSystemCollAbi = require("../helper/abis/getEntireSystemColl.abi.json");
const sdk = require("@defillama/sdk");

const chain = "bsc";
const e18 = new BigNumber(10).pow(18);

const BSC_ADDRESS = "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const TROVE_MANAGER_ADDRESS = "0x7efC97EA11bc03bF5ABF4474Cb614C409Ef34957";

const bsc = {
  busd: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  usdt: "0x55d398326f99059fF775485246999027B3197955",
  arth: "0x85daB10c3BA20148cA60C2eb955e1F8ffE9eAa79",
  maha: "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b",
  wbnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",

  valUsdc: "0xA6fDEa1655910C504E974f7F1B520B74be21857B",
  valUsdt: "0x5f7f6cB266737B89f7aF86b30F03Ae94334b83e9",
  valBusd: "0xaeD19DAB3cd68E4267aec7B2479b1eD2144Ad77f",

  "ellipsis.arthuval3ps.token": "0xC5C71ACCCa3A1357985E8912e1ED0aa910C30BdC",
  "ellipsis.arthuval3ps.pool": "0xAF6b98B5Dc17f4A9a5199545A1c29eE427266Da4",

  "arth.usd": "0x8B02998366F7437F6c4138F4b543EA5c000cD608",

  "ellipsis.val3eps.token": "0x5b5bD8913D766D005859CE002533D4838B0Ebbb5",
  "ellipsis.val3eps.pool": "0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d",
};

Object.keys(bsc).forEach((k) => (bsc[k] = bsc[k].toLowerCase()));

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

const replaceMAHAonBSCTransform = (addr) => {
  if (addr.toLowerCase() === "0xce86f7fcd3b40791f63b86c3ea3b8b355ce2685b")
    return "mahadao";

  if (addr.toLowerCase() === "0xb69a424df8c737a122d0e60695382b3eec07ff4b")
    return "arth";
  return `bsc:${addr}`;
};

const getTVLOfarthuval3ps = async (balances, block) => {
  //get balance of arth-usd of arth-usd+val3eps
  const arthUSDBalance = await getBalance(
    bsc["arth.usd"],
    bsc["ellipsis.arthuval3ps.pool"],
    block
  );

  sdk.util.sumSingleBalance(balances, "arth.usd", arthUSDBalance);

  // get balance of val3eps of arth-usd+val3eps
  const balanceval3ps = await getBalance(
    bsc["ellipsis.val3eps.token"],
    bsc["ellipsis.arthuval3ps.pool"],
    block
  );

  const totalSupply3eps = await getTotalSupply(
    bsc["ellipsis.val3eps.token"],
    block
  );

  const valEpsPercentage = balanceval3ps / totalSupply3eps;

  const valBUSDBalance = await getBalance(
    bsc.valBusd,
    bsc["ellipsis.val3eps.pool"],
    block
  );
  const valUSDCBalance = await getBalance(
    bsc.valUsdc,
    bsc["ellipsis.val3eps.pool"],
    block
  );
  const valUSDTBalance = await getBalance(
    bsc.valUsdt,
    bsc["ellipsis.val3eps.pool"],
    block
  );

  const totalValBUSDSupply = await getTotalSupply(bsc.valBusd, block);
  const totalValUSDCSupply = await getTotalSupply(bsc.valUsdc, block);
  const totalValUSDTSupply = await getTotalSupply(bsc.valUsdt, block);

  const valUSDCPercentage =
    (valUSDCBalance * valEpsPercentage) / totalValUSDCSupply;
  const valUSDTPercentage =
    (valUSDTBalance * valEpsPercentage) / totalValUSDTSupply;
  const valBUSDPercentage =
    (valBUSDBalance * valEpsPercentage) / totalValBUSDSupply;

  const busdBalance = await getBalance(bsc.busd, bsc.valBusd, block);
  const usdcBalance = await getBalance(bsc.usdc, bsc.valUsdc, block);
  const usdtBalance = await getBalance(bsc.usdt, bsc.valUsdt, block);

  sdk.util.sumSingleBalance(
    balances,
    "usd-coin",
    (usdcBalance * valUSDCPercentage) / e18
  );
  sdk.util.sumSingleBalance(
    balances,
    "tether",
    (usdtBalance * valUSDTPercentage) / e18
  );
  sdk.util.sumSingleBalance(
    balances,
    "binance-usd",
    (busdBalance * valBUSDPercentage) / e18
  );

  return;
};

async function pool2(_timestamp, _ethBlock, chainBlocks) {
  const balances = {};

  // await sumTokens(
  //   balances,
  //   [
  //     // apeswap MAHA/BNB
  //     [bsc.wbnb, bsc["apeswap.bnbMahaLP"]],
  //     [bsc.maha, bsc["apeswap.bnbMahaLP"]],
  //   ],
  //   chainBlocks.bsc,
  //   "bsc",
  //   replaceMAHAonBSCTransform
  // );

  await getTVLOfarthuval3ps(balances, chainBlocks.bsc);

  if (balances.arth && balances.mahadao) {
    balances.arth = balances.arth / 1e18;
    balances.mahadao = balances.mahadao / 1e18;
  }

  balances.arth = balances["arth.usd"]
    ? balances["arth.usd"] / 2 / 1e18
    : balances["arth.usd"] / 2 / 1e18 + balances.arth;
  delete balances["arth.usd"];

  return balances;
}

async function tvl(_, block) {
  const troveBscTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block,
      chain,
    })
  ).output;

  return {
    [BSC_ADDRESS]: troveBscTvl,
  };
}

module.exports = {
  pool2,
  tvl,
};

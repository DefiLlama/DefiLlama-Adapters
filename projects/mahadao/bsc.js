const { balanceOf, totalSupply } = require("@defillama/sdk/build/erc20");
const { sumTokens } = require("../helper/unwrapLPs.js");
const { unwrapTroves } = require("../helper/unwrapLPs");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");

const chain = "bsc";
const e18 = new BigNumber(10).pow(18);

const bsc = {
  "apeswap.arthMahaLP": "0x84020eefe28647056eac16cb16095da2ccf25665",
  "apeswap.bnbMahaLP": "0x0a1ba34833798a3d160a8958f39e46fef3fe7f4e",

  "pcs.arthMahaLP": "0xb955d5b120ff5b803cdb5a225c11583cd56b7040",
  "pcs.arthBusdLP": "0x80342bc6125a102a33909d124a6c26CC5D7b8d56",

  busd: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  usdt: "0x55d398326f99059fF775485246999027B3197955",
  arth: "0xb69a424df8c737a122d0e60695382b3eec07ff4b",
  wbnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  maha: "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b",

  valUsdc: "0xA6fDEa1655910C504E974f7F1B520B74be21857B",
  valUsdt: "0x5f7f6cB266737B89f7aF86b30F03Ae94334b83e9",
  valBusd: "0xaeD19DAB3cd68E4267aec7B2479b1eD2144Ad77f",

  "ellipsis.arthu3eps.token": "0xB38B49bAE104BbB6A82640094fd61b341a858f78",
  "ellipsis.arthu3eps.pool": "0x98245Bfbef4e3059535232D68821a58abB265C45",
  "ellipsis.arthuval3ps.token": "0x4cfaabd5920021359bb22bb6924cce708773b6ac",
  "ellipsis.arthuval3ps.pool": "0x1d4B4796853aEDA5Ab457644a18B703b6bA8b4aB",

  "arth.usd": "0x88fd584dF3f97c64843CD474bDC6F78e398394f4",

  "ellipsis.3eps.token": "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452",
  "ellipsis.3eps.pool": "0x160CAed03795365F3A589f10C379FfA7d75d4E76",
  "ellipsis.val3eps.token": "0x5b5bD8913D766D005859CE002533D4838B0Ebbb5",
  "ellipsis.val3eps.pool": "0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d",
};

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

async function getTVLOfarthu3ps(balances, block) {
  const arthuBal = await getBalance(
    bsc["arth.usd"],
    bsc["ellipsis.arthu3eps.pool"],
    block
  );
  const epsBal = await getBalance(
    bsc["ellipsis.3eps.token"],
    bsc["ellipsis.arthu3eps.pool"],
    block
  );

  const token2Amount = new BigNumber(epsBal).dividedBy(e18);

  sdk.util.sumSingleBalance(balances, "arth.usd", arthuBal);
  sdk.util.sumSingleBalance(balances, "usd-coin", token2Amount.toNumber()); // todo: need to break this down
}

const getTVLOfarthuval3ps = async (balances, block) => {
  //get balance of arth-usd of arth-usd+val3eps
  const arthUSDBalance = await getBalance(
    bsc["arth.usd"],
    bsc["ellipsis.arthuval3ps.pool"],
    block
  );

  sdk.util.sumSingleBalance(balances, "arth.usd", arthUSDBalance);

  // get balance of val3eps of arth-usd+val3eps
  const val3EPSowned = await getBalance(
    bsc["ellipsis.val3eps.token"],
    bsc["ellipsis.arthuval3ps.pool"],
    block
  );

  // todo hack for now
  sdk.util.sumSingleBalance(balances, "usd-coin", val3EPSowned / e18);
  return;
};

async function pool2(_timestamp, _ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks[chain]
  const tokensAndOwners = [
    // apeswap ARTH/MAHA
    [bsc.arth, bsc["apeswap.arthMahaLP"]],
    [bsc.maha, bsc["apeswap.arthMahaLP"]],

    // apeswap MAHA/BNB
    [bsc.wbnb, bsc["apeswap.bnbMahaLP"]],
    [bsc.maha, bsc["apeswap.bnbMahaLP"]],

    // pcs MAHA/ARTH
    [bsc.arth, bsc["pcs.arthMahaLP"]],
    [bsc.maha, bsc["pcs.arthMahaLP"]],

    // pcs ARTH/BUSD
    [bsc.arth, bsc["pcs.arthBusdLP"]],
    [bsc.busd, bsc["pcs.arthBusdLP"]],
  ]

  await sumTokens(balances, tokensAndOwners, block, chain)

  // // todo not accurate
  // await getTVLOfarthuval3ps(balances, chainBlocks.bsc);
  // await getTVLOfarthu3ps(balances, chainBlocks.bsc);

  // balances.arth = balances.arth / 1e18;
  // balances.mahadao = balances.mahadao / 1e18;

  // balances.arth = balances["arth.usd"] / 2 / 1e18 + balances.arth;
  // delete balances["arth.usd"];

  return balances;
}

async function tvl(ts, _block, chainBlocks) {
  const balances = {};
  const chain = "bsc";
  const block = chainBlocks[chain];
  const troves = [
    // troves
    "0x8F2C37D2F8AE7Bce07aa79c768CC03AB0E5ae9aE", // wbnb
    "0x1Beb8b4911365EabEC68459ecfe9172f174BF0DB", // busd
    "0xD31AC58374D4a0b3C58dFF36f2F59A22348159DB", // maha
    "0x0f7e695770e1bc16a9a899580828e22b16d93314", // BUSDUSDC-APE-LP
    "0x7A535496c5a0eF6A9B014A01e1aB9d7493F503ea", // BUSDUSDT-APE-LP
    "0x3a00861B7040386b580A4168Db9eD5D4D9dDa7BF", // BUSDUSDC-APE-LP-S
    "0x45Bc65D7Bb6d26676D12aC4646c8cC344DCe4e60", // BUSDUSDT-APE-LP-S
    "0x7cce62085AdEFa3fE9572546fD77fF1aA1088BEc", // BUSD-A
  ];
  await unwrapTroves({ balances, troves, chain, block });
  return balances;
}

module.exports = {
  pool2,
  tvl,
};

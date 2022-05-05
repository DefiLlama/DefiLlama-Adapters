const { balanceOf, totalSupply } = require("@defillama/sdk/build/erc20");
const { sumTokens } = require("../helper/unwrapLPs.js");
const { unwrapTroves } = require("../helper/unwrapLPs");
const BigNumber = require("bignumber.js");
const getEntireSystemCollAbi = require("../helper/abis/getEntireSystemColl.abi.json");
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

const getResponse = async (target, abi, block, chain, params = []) => {
  if (params.length < 0)
    return await sdk.api.abi.call({
      target: target,
      abi: abi,
      block,
      chain,
    });
  else
    return await sdk.api.abi.call({
      target: target,
      abi: abi,
      block,
      params,
      chain,
    });
};

function getArthTvl(
  TROVE_ADDRESSES,
  COLLATERAL_ADDRESSES,
  chain,
  coingeckoIds = [],
  decimals = [],
  symbols = []
) {
  return async (_, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];

    const ret = {};
    const tvls = await Promise.all(
      TROVE_ADDRESSES.map((trove) =>
        sdk.api.abi.call({
          target: trove,
          abi: getEntireSystemCollAbi,
          block,
          chain,
        })
      )
    );

    COLLATERAL_ADDRESSES.forEach(async (collateral, index) => {
      const collateralKeys = Object.keys(collateral);
      let key = chain + ":" + collateral[collateralKeys[0]][0];
      let val = tvls[index].output;

      if (coingeckoIds[index]) key = coingeckoIds[index];

      if (ret[key] == undefined) ret[key] = BigNumber(0);

      if (decimals[index] !== undefined)
        val = Number(val) / 10 ** decimals[index];

      ret[key] = ret[key].plus(BigNumber(val));
    });

    return ret;
  };
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

async function getTVLOfarthu3ps(balances, block) {
  const arthuBal = await getBalance(
    bsc["arth.usd"],
    bsc["ellipsis.arthu3eps.pool"],
    block
  );
  sdk.util.sumSingleBalance(balances, "arth.usd", arthuBal);

  const epsBal = await getBalance(
    bsc["ellipsis.3eps.token"],
    bsc["ellipsis.arthu3eps.pool"],
    block
  );
  const epsTotalSupply = await getTotalSupply(
    bsc["ellipsis.3eps.token"],
    block
  );

  const epsPercentage = epsBal / epsTotalSupply;

  const busdBalance = await getBalance(
    bsc.busd,
    bsc["ellipsis.3eps.pool"],
    block
  );
  // const busdAmount = new BigNumber(busdBalance).dividedBy(e18);

  const usdcBalance = await getBalance(
    bsc.usdc,
    bsc["ellipsis.3eps.pool"],
    block
  );
  // const usdcAmount = new BigNumber(usdcBalance).dividedBy(e18);

  const usdtBalance = await getBalance(
    bsc.usdt,
    bsc["ellipsis.3eps.pool"],
    block
  );
  // const usdtAmount = new BigNumber(usdtBalance).dividedBy(e18);

  sdk.util.sumSingleBalance(
    balances,
    "binance-usd",
    (busdBalance * epsPercentage) / 1e18
  ); // todo: need to break this down
  sdk.util.sumSingleBalance(
    balances,
    "tether",
    (usdtBalance * epsPercentage) / 1e18
  );
  sdk.util.sumSingleBalance(
    balances,
    "usd-coin",
    (usdcBalance * epsPercentage) / 1e18
  );
}

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
};

function pool2s() {
  return async (_timestamp, _ethBlock, chainBlocks) => {
    const balances = {};

    await sumTokens(
      balances,
      [
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
      ],
      chainBlocks.bsc,
      "bsc",
      replaceMAHAonBSCTransform
    );

    // todo not accurate
    await getTVLOfarthuval3ps(balances, chainBlocks.bsc);
    await getTVLOfarthu3ps(balances, chainBlocks.bsc);

    if (balances.arth && balances.mahadao) {
      balances.arth = balances.arth / 1e18;
      balances.mahadao = balances.mahadao / 1e18;
    }

    balances.arth = balances["arth.usd"]
      ? balances["arth.usd"] / 2 / 1e18
      : balances["arth.usd"] / 2 / 1e18 + balances.arth;
    delete balances["arth.usd"];

    return balances;
  };
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
  ];
  await unwrapTroves({ balances, troves, chain, block });
  return balances;
}

module.exports = {
  pool2: pool2s(),
  tvl: tvl,
};

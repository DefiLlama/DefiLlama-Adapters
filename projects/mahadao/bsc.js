const { balanceOf, totalSupply } = require("@defillama/sdk/build/erc20");
const { sumTokens } = require("../helper/unwrapLPs.js");
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
  const epsBal = await getBalance(
    bsc["ellipsis.3eps.token"],
    bsc["ellipsis.arthu3eps.pool"],
    block
  );

  const token2Amount = new BigNumber(epsBal).dividedBy(e18);

  sdk.util.sumSingleBalance(balances, "arth.usd", arthuBal);
  sdk.util.sumSingleBalance(balances, "usd-coin", token2Amount.toNumber()); // todo: need to break this down
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
  const val3EPSowned = await getBalance(
    bsc["ellipsis.val3eps.token"],
    bsc["ellipsis.arthuval3ps.pool"],
    block
  );

  // todo hack for now
  sdk.util.sumSingleBalance(balances, "usd-coin", val3EPSowned / e18);
  return;
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

    balances.arth = balances.arth / 1e18;
    balances.mahadao = balances.mahadao / 1e18;

    balances.arth = balances["arth.usd"] / 2 / 1e18 + balances.arth;
    delete balances["arth.usd"];

    return balances;
  };
}

module.exports = {
  pool2: pool2s(),
  tvl: getArthTvl(
    [
      // troves
      "0x8F2C37D2F8AE7Bce07aa79c768CC03AB0E5ae9aE", // wbnb
      "0x1Beb8b4911365EabEC68459ecfe9172f174BF0DB", // busd
      "0xD31AC58374D4a0b3C58dFF36f2F59A22348159DB", // maha
      // "0xD31AC58374D4a0b3C58dFF36f2F59A22348159DB", // busd-usdc-lp-s
      // "0x7A535496c5a0eF6A9B014A01e1aB9d7493F503ea", // busd-usdt-lp-s
    ],
    [
      // collaterals
      { wbnb: ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"] }, // wbnb
      { busd: ["0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"] }, // busd
      { maha: ["0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b"] }, // maha
      // {
      //   "busdusdc-ape-lps": [
      //     "0xbb9858603b1fb9375f6df972650343e985186ac5",
      //     "0xc087c78abac4a0e900a327444193dbf9ba69058e",
      //     "0x5c8d727b265dbafaba67e050f2f739caeeb4a6f9",
      //   ],
      // }, //busdusdc-ape-lps
      // {
      //   "busdusdt-ape-lps": [
      //     "0xc5FB6476a6518dd35687e0Ad2670CB8Ab5a0D4C5",
      //     "0x2e707261d086687470B515B320478Eb1C88D49bb",
      //     "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9",
      //   ],
      // }, //busdusdt-ape-lps
    ],
    "bsc",
    [undefined, undefined, "mahadao"],
    [undefined, undefined, 18]
  ),
};

const { getArthTvl } = require("../helper/arth");
const { balanceOf, totalSupply } = require("@defillama/sdk/build/erc20");
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs.js");
const BigNumber = require("bignumber.js");
const getEntireSystemCollAbi = require("../helper/abis/getEntireSystemColl.abi.json");
const sdk = require("@defillama/sdk");

const bsc = {
  arthBusdStaking: "0xE8b16cab47505708a093085926560a3eB32584B8",
  arthMahaStaking: "0x7699d230Ba47796fc2E13fba1D2D52Ecb0318c33",
  arthu3epsStaking: "0x6398c73761a802a7db8f6418ef0a299301bc1fb0",
  arthu3epsLP: "0xB38B49bAE104BbB6A82640094fd61b341a858f78",
  arthuval3ps: "0x1d4B4796853aEDA5Ab457644a18B703b6bA8b4aB", //
  arthMahaApeLP: "0x84020eefe28647056eac16cb16095da2ccf25665", //
  arthMahaLP: "0xb955d5b120ff5b803cdb5a225c11583cd56b7040",
  arthBusdLP: "0x80342bc6125a102a33909d124a6c26CC5D7b8d56",
  busd: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  usdt: "0x55d398326f99059fF775485246999027B3197955",
  arth: "0xb69a424df8c737a122d0e60695382b3eec07ff4b",
  maha: "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b",
  epsStableswap: "0x98245Bfbef4e3059535232D68821a58abB265C45",
  "bsc.3eps": "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452",
  "arth.usd.token": "0x88fd584dF3f97c64843CD474bDC6F78e398394f4",
  "bsc.3eps.token": "0x5b5bD8913D766D005859CE002533D4838B0Ebbb5",
  "bsc.3eps.pool": "0x160CAed03795365F3A589f10C379FfA7d75d4E76",
};

async function getBalanceOfStakedEllipsisLP(
  balances,
  stableSwapAddress,
  stakingContract,
  lpToken,
  tokens,
  block,
  chain
) {
  const stakedLpTokens = await balanceOf({
    target: lpToken,
    owner: stakingContract,
    block,
    chain,
  });

  const totalLPSupply = await totalSupply({
    target: lpToken,
    block,
    chain,
  });

  const percentage = stakedLpTokens.output / totalLPSupply.output;

  const token1Balance = await balanceOf({
    target: tokens[0],
    owner: stableSwapAddress,
    block,
    chain,
  });


  const token2Balance = await balanceOf({
    target: tokens[1],
    owner: stableSwapAddress,
    block,
    chain,
  });

  const e18 = new BigNumber(10).pow(18);
  const token1Amount = new BigNumber(
    token1Balance.output * percentage
  ).dividedBy(e18);
  const token2Amount = new BigNumber(
    token2Balance.output * percentage
  ).dividedBy(e18);

  sdk.util.sumSingleBalance(balances, "usd-coin", token1Amount.toNumber());
  sdk.util.sumSingleBalance(balances, "usd-coin", token2Amount.toNumber());
}

const replaceMAHAonBSCTransform = (addr) => {
  if (addr.toLowerCase() === "0xce86f7fcd3b40791f63b86c3ea3b8b355ce2685b")
    return "mahadao";
  return `bsc:${addr}`;
};

const getBalanceOfPoolToken = async (
  balances,
  arthMahaApeLP,
  maha,
  arth,
  block,
  chain,
) => {

  const mahaBalance = await balanceOf({
    target: maha,
    owner: arthMahaApeLP,
    block,
    chain,
  })
  const arthBalance = await balanceOf({
    target: arth,
    owner: arthMahaApeLP,
    block,
    chain,
  })


  balances['mahadao'] = balances.mahadao / 1e18 + mahaBalance.output / 1e18
  balances['arth'] = arthBalance.output / 1e18

}

const get3epsBalance = async (
  balances,
  percentage,
  pool3eps,
  usdcToken,
  usdtToken,
  busdToken,
  block,
  chain,
) => {
  const e18 = new BigNumber(10).pow(18);
  console.log('125', percentage);

  const usdcBalance = await balanceOf({
    target: usdcToken,
    owner: pool3eps,
    block,
    chain
  })
  console.log('usdc', usdcBalance);
  const usdtBalance = await balanceOf({
    target: usdtToken,
    owner: pool3eps,
    block,
    chain
  })

  console.log('usdt', usdtBalance);

  const busdBalance = await balanceOf({
    target: busdToken,
    owner: pool3eps,
    block,
    chain
  })

  console.log('busd', busdBalance);

  sdk.util.sumSingleBalance(balances, "usd-coin", (usdcBalance.output * percentage) / e18);
  sdk.util.sumSingleBalance(balances, "tether", (usdtBalance.output * percentage) / e18);
  sdk.util.sumSingleBalance(balances, "binance-usd", (busdBalance.output * percentage) / e18);


  console.log('after', balances);
}

const getTVLOfarthuval3ps = async (
  balances,
  arthuval3psLP,
  token3eps,
  tokenARTHUSDC,
  BSC3eps,
  pool3eps,
  block,
  chain,
) => {

  const arthUSDBalance = await balanceOf({
    target: tokenARTHUSDC,
    owner: arthuval3psLP,
    block,
    chain,
  })
  balances['arth'] = balances['arth'] ? balances['arth'] + (arthUSDBalance.output / 1e18) / 2 : (arthUSDBalance.output / 1e18) / 2

  const balance3ps = await balanceOf({
    target: token3eps,
    owner: arthuval3psLP,
    block,
    chain,
  })

  const totalSupply3eps = await totalSupply({
    target: BSC3eps,
    block,
    chain,
  })

  const percentage = balance3ps.output / totalSupply3eps.output

  await get3epsBalance(
    balances,
    percentage,
    pool3eps,
    bsc.usdc,
    bsc.usdt,
    bsc.busd,
    block,
    chain
  )

}

function pool2s() {
  return async (_timestamp, _ethBlock, chainBlocks) => {
    const balances = {};

    // calculate tvl for regular uniswap lp tokens
    const stakingContracts = [bsc.arthBusdStaking, bsc.arthMahaStaking];
    const lpTokens = [bsc.arthBusdLP, bsc.arthMahaLP];
    await sumTokensAndLPsSharedOwners(
      balances,
      lpTokens.map((token) => [token, true]),
      stakingContracts,
      chainBlocks.bsc,
      "bsc",
      replaceMAHAonBSCTransform
    );

    // calculate tvl for curve lp tokens
    await getBalanceOfStakedEllipsisLP(
      balances,
      bsc.epsStableswap,
      bsc.arthu3epsStaking, // staked
      bsc.arthu3epsLP, // lp token
      [bsc["arth.usd.token"], bsc["bsc.3eps.token"]],
      chainBlocks.bsc,
      "bsc"
    );


    await getBalanceOfPoolToken(
      balances,
      bsc.arthMahaApeLP,
      bsc.maha,
      bsc.arth,
      chainBlocks.bsc,
      "bsc"
    )

    await getTVLOfarthuval3ps(
      balances,
      bsc.arthuval3ps,
      bsc['bsc.3eps.token'],
      bsc['arth.usd.token'],
      bsc['bsc.3eps'],
      bsc['bsc.3eps.pool'],
      chainBlocks.bsc,
      "bsc"
    )

    // if (balances.mahadao) balances.mahadao = balances.mahadao / 1e18;
    // console.log(balances);
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
      "0x0F7e695770E1bC16a9A899580828e22B16d93314", // maha
      "0xD31AC58374D4a0b3C58dFF36f2F59A22348159DB", //busd-usdc-lp-s
      "0x7A535496c5a0eF6A9B014A01e1aB9d7493F503ea", //busd-usdt-lp-s
    ],
    [
      // collaterals
      { "wbnb": ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"] }, // wbnb
      { "busd": ["0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"] }, // busd
      { "maha": ["0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b"] }, // maha
      { "busdusdc-ape-lps": ["0xbb9858603b1fb9375f6df972650343e985186ac5", "0xc087c78abac4a0e900a327444193dbf9ba69058e", "0x5c8d727b265dbafaba67e050f2f739caeeb4a6f9"] },//busdusdc-ape-lps
      { "busdusdt-ape-lps": ["0xc5FB6476a6518dd35687e0Ad2670CB8Ab5a0D4C5", "0x2e707261d086687470B515B320478Eb1C88D49bb", "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9"] },//busdusdt-ape-lps

    ],
    "bsc",
    [undefined, undefined, "mahadao"],
    [undefined, undefined, 18]
  ),
};

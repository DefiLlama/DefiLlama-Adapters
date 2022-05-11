const { balanceOf, totalSupply } = require("@defillama/sdk/build/erc20");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs.js");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");
const { unwrapTroves, } = require('../helper/unwrapLPs')

const bsc = {
  arthBusdStaking: "0xE8b16cab47505708a093085926560a3eB32584B8",
  arthMahaStaking: "0x7699d230Ba47796fc2E13fba1D2D52Ecb0318c33",
  arthu3epsStaking: "0x6398c73761a802a7db8f6418ef0a299301bc1fb0",
  arthu3epsLP: "0xB38B49bAE104BbB6A82640094fd61b341a858f78",
  arthMahaLP: "0xb955d5b120ff5b803cdb5a225c11583cd56b7040",
  arthBusdLP: "0x80342bc6125a102a33909d124a6c26CC5D7b8d56",
  busd: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  arth: "0xb69a424df8c737a122d0e60695382b3eec07ff4b",
  maha: "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b",
  epsStableswap: "0x98245Bfbef4e3059535232D68821a58abB265C45",
  "arth.usd": "0x88fd584dF3f97c64843CD474bDC6F78e398394f4",
  "bsc.3eps": "0xaf4de8e872131ae328ce21d909c74705d3aaf452",
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
      [bsc["arth.usd"], bsc["bsc.3eps"]],
      chainBlocks.bsc,
      "bsc"
    );

    if (balances.mahadao) balances.mahadao = balances.mahadao / 1e18;
    return balances;
  };
}

async function tvl(ts, _block, chainBlocks) {
  const balances = {}
  const chain = 'bsc'
  const block = chainBlocks[chain];
  const troves = [
    // troves
    "0x8F2C37D2F8AE7Bce07aa79c768CC03AB0E5ae9aE", // wbnb
    "0x1Beb8b4911365EabEC68459ecfe9172f174BF0DB", // busd
    "0xD31AC58374D4a0b3C58dFF36f2F59A22348159DB", // maha
    "0x0f7e695770e1bc16a9a899580828e22b16d93314", // BUSDUSDC-APE-LP
    "0x7A535496c5a0eF6A9B014A01e1aB9d7493F503ea", // BUSDUSDT-APE-LP
  ]
  await unwrapTroves({ balances, troves, chain, block })
  return balances;
}

module.exports = {
  pool2: pool2s(),
  tvl,
};

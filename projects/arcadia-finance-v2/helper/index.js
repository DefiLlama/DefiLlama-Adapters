const { sumTokens2 } = require("../../helper/unwrapLPs");
const abi = require("./abi.json");
const Web3 = require("web3");
const JSBI = require("jsbi");
const { getCreate2Address } = require("@ethersproject/address");

const config = {
  base: {
    factory: "0xDa14Fdd72345c4d2511357214c5B89A919768e59",
    pools: {
      wethPool: "0x803ea69c7e87D1d6C86adeB40CB636cC0E6B98E2",
      usdcPool: "0x3ec4a293Fb906DD2Cd440c20dECB250DeF141dF1",
    },
    nftPosManager: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
    univ3_factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
  },
};

const POOL_INIT_CODE_HASH =
  "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";
const ZERO = JSBI.BigInt(0);
const ONE = JSBI.BigInt(1);
const Q32 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(32));
const MaxUint256 = JSBI.subtract(
  JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(256)),
  JSBI.BigInt(1)
);

function computeAddress(factory, token0, token1, fee) {
  const poolkey = Web3.utils.keccak256(
    Web3.eth.abi.encodeParameters(
      ["address", "address", "uint24"],
      [token0, token1, fee]
    )
  );
  const poolAddressFromSdk = getCreate2Address(
    factory,
    poolkey,
    POOL_INIT_CODE_HASH
  );
  return Web3.utils.toChecksumAddress(poolAddressFromSdk);
}

function mulDiv(a, b, denominator) {
  let product = JSBI.multiply(JSBI.BigInt(a), JSBI.BigInt(b));
  return JSBI.divide(product, JSBI.BigInt(denominator));
}

function getAmountsFromLiquidity(
  sqrtRatioX96,
  tickLower,
  tickUpper,
  liquidity
) {
  const sqrtRatioAX96 = getSqrtRatioAtTick(tickLower);
  const sqrtRatioBX96 = getSqrtRatioAtTick(tickUpper);
  let amount0,
    amount1 = 0;

  if (JSBI.lessThanOrEqual(sqrtRatioX96, sqrtRatioAX96)) {
    amount0 = getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity);
  } else if (JSBI.lessThan(sqrtRatioX96, sqrtRatioBX96)) {
    amount0 = getAmount0ForLiquidity(sqrtRatioX96, sqrtRatioBX96, liquidity);
    amount1 = getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioX96, liquidity);
  } else {
    amount1 = getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity);
  }

  return { amount0, amount1 };
}

function getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity) {
  if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
    [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
  }

  const X96 = JSBI.BigInt(96);

  let result = mulDiv(
    JSBI.leftShift(liquidity, X96),
    JSBI.subtract(sqrtRatioBX96, sqrtRatioAX96),
    sqrtRatioBX96
  );
  result = JSBI.divide(result, sqrtRatioAX96);
  return result;
}

function getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity) {
  if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
    [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
  }
  const denominator = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
  let result = mulDiv(
    liquidity,
    JSBI.subtract(sqrtRatioBX96, sqrtRatioAX96),
    denominator
  );
  return result;
}

function mulShift(val, mulBy) {
  return JSBI.signedRightShift(
    JSBI.multiply(val, JSBI.BigInt(mulBy)),
    JSBI.BigInt(128)
  );
}

function getSqrtRatioAtTick(tick) {
  const absTick = tick < 0 ? tick * -1 : tick;
  let ratio =
    (absTick & 0x1) != 0
      ? JSBI.BigInt("0xfffcb933bd6fad37aa2d162d1a594001")
      : JSBI.BigInt("0x100000000000000000000000000000000");
  if ((absTick & 0x2) != 0)
    ratio = mulShift(ratio, "0xfff97272373d413259a46990580e213a");
  if ((absTick & 0x4) != 0)
    ratio = mulShift(ratio, "0xfff2e50f5f656932ef12357cf3c7fdcc");
  if ((absTick & 0x8) != 0)
    ratio = mulShift(ratio, "0xffe5caca7e10e4e61c3624eaa0941cd0");
  if ((absTick & 0x10) != 0)
    ratio = mulShift(ratio, "0xffcb9843d60f6159c9db58835c926644");
  if ((absTick & 0x20) != 0)
    ratio = mulShift(ratio, "0xff973b41fa98c081472e6896dfb254c0");
  if ((absTick & 0x40) != 0)
    ratio = mulShift(ratio, "0xff2ea16466c96a3843ec78b326b52861");
  if ((absTick & 0x80) != 0)
    ratio = mulShift(ratio, "0xfe5dee046a99a2a811c461f1969c3053");
  if ((absTick & 0x100) != 0)
    ratio = mulShift(ratio, "0xfcbe86c7900a88aedcffc83b479aa3a4");
  if ((absTick & 0x200) != 0)
    ratio = mulShift(ratio, "0xf987a7253ac413176f2b074cf7815e54");
  if ((absTick & 0x400) != 0)
    ratio = mulShift(ratio, "0xf3392b0822b70005940c7a398e4b70f3");
  if ((absTick & 0x800) != 0)
    ratio = mulShift(ratio, "0xe7159475a2c29b7443b29c7fa6e889d9");
  if ((absTick & 0x1000) != 0)
    ratio = mulShift(ratio, "0xd097f3bdfd2022b8845ad8f792aa5825");
  if ((absTick & 0x2000) != 0)
    ratio = mulShift(ratio, "0xa9f746462d870fdf8a65dc1f90e061e5");
  if ((absTick & 0x4000) != 0)
    ratio = mulShift(ratio, "0x70d869a156d2a1b890bb3df62baf32f7");
  if ((absTick & 0x8000) != 0)
    ratio = mulShift(ratio, "0x31be135f97d08fd981231505542fcfa6");
  if ((absTick & 0x10000) != 0)
    ratio = mulShift(ratio, "0x9aa508b5b7a84e1c677de54f3e99bc9");
  if ((absTick & 0x20000) != 0)
    ratio = mulShift(ratio, "0x5d6af8dedb81196699c329225ee604");
  if ((absTick & 0x40000) != 0)
    ratio = mulShift(ratio, "0x2216e584f5fa1ea926041bedfe98");
  if ((absTick & 0x80000) != 0)
    ratio = mulShift(ratio, "0x48a170391f7dc42444e8fa2");

  if (tick > 0) ratio = JSBI.divide(MaxUint256, ratio);

  return JSBI.greaterThan(JSBI.remainder(ratio, Q32), ZERO)
    ? JSBI.add(JSBI.divide(ratio, Q32), ONE)
    : JSBI.divide(ratio, Q32);
}

let tokenAmounts = {};

function updateOrAddKeyValue(tokenAddress, valueToAdd) {
  if (tokenAmounts.hasOwnProperty(tokenAddress)) {
    tokenAmounts[tokenAddress] += valueToAdd;
  } else {
    tokenAmounts[tokenAddress] = valueToAdd;
  }
}

async function tvl(api) {
  const { chain } = api;
  let { factory, pools, nftPosManager, univ3_factory } = config[chain];
  pools = Object.values(pools);
  const poolAssets = await api.multiCall({
    abi: abi.underlyingAsset,
    calls: pools.map((pool) => ({ target: pool })),
  });

  const accounts = await api.fetchList({
    lengthAbi: abi.accountsLength,
    itemAbi: abi.accountAddress,
    target: factory,
  });
  const assetData = await api.multiCall({
    abi: abi.assetData,
    calls: accounts,
  });

  for (const assets of assetData) {
    const length = assets[0].length;
    for (let i = 0; i < length; i++) {
      const assetAddress = assets[0][i];
      const assetId = assets[1][i];
      const assetAmount = assets[2][i];
      if (parseInt(assetId) > 0) {
        const [
          ,
          ,
          token0,
          token1,
          fee,
          tickLower,
          tickUpper,
          liquidity,
          ,
          ,
          ,
        ] = await api.call({
          target: nftPosManager,
          abi: abi.position,
          params: [assetId],
        });
        const poolAddress = computeAddress(univ3_factory, token0, token1, fee);
        const slot0 = await api.call({ target: poolAddress, abi: abi.slot0 });
        const sqrtPriceX96 = JSBI.BigInt(slot0[0]);
        const { amount0, amount1 } = getAmountsFromLiquidity(
          sqrtPriceX96,
          tickLower,
          tickUpper,
          JSBI.BigInt(liquidity)
        );
        updateOrAddKeyValue(token0, JSBI.toNumber(amount0));
        updateOrAddKeyValue(token1, JSBI.toNumber(amount1));
      } else {
        updateOrAddKeyValue(assetAddress, parseInt(assetAmount));
      }
    }
  }

  api.addTokens(Object.keys(tokenAmounts), Object.values(tokenAmounts));

  return sumTokens2({ api, tokensAndOwners2: [poolAssets, pools] });
}

module.exports = {
  tvl,
};

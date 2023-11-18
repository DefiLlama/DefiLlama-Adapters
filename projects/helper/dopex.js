const Q96 = BigInt("0x1000000000000000000000000");
const RESOLUTION = BigInt(96);

const MIN_TICK = BigInt(-887272);
const MAX_TICK = BigInt(-MIN_TICK);

const maxUint256 = 2n ** 256n - 1n;

function getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity) {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    const temp = sqrtRatioBX96;
    sqrtRatioBX96 = sqrtRatioAX96;
    sqrtRatioAX96 = temp;
  }

  return (
    ((liquidity << RESOLUTION) * (sqrtRatioBX96 - sqrtRatioAX96)) /
    sqrtRatioBX96 /
    sqrtRatioAX96
  );
}

function getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity) {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    const temp = sqrtRatioBX96;
    sqrtRatioBX96 = sqrtRatioAX96;
    sqrtRatioAX96 = temp;
  }
  return (liquidity * (sqrtRatioBX96 - sqrtRatioAX96)) / Q96;
}

function getAmountsForLiquidity(
  sqrtRatioX96,
  sqrtRatioAX96,
  sqrtRatioBX96,
  liquidity
) {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    const temp = sqrtRatioBX96;
    sqrtRatioBX96 = sqrtRatioAX96;
    sqrtRatioAX96 = temp;
  }

  let amount0 = 0n;
  let amount1 = 0n;
  if (sqrtRatioX96 <= sqrtRatioAX96) {
    amount0 = getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity);
  } else if (sqrtRatioX96 < sqrtRatioBX96) {
    amount0 = getAmount0ForLiquidity(sqrtRatioX96, sqrtRatioBX96, liquidity);
    amount1 = getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioX96, liquidity);
  } else {
    amount1 = getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity);
  }

  return {
    amount0,
    amount1,
  };
}

function getSqrtRatioAtTick(tick) {
  const absTick = tick < 0 ? -tick : tick;
  if (absTick > MAX_TICK) throw Error("T");

  let ratio =
    (absTick & BigInt("0x1")) != 0n
      ? BigInt("0xfffcb933bd6fad37aa2d162d1a594001")
      : BigInt("0x100000000000000000000000000000000");

  if ((absTick & BigInt("0x2")) != 0n)
    ratio = (ratio * BigInt("0xfff97272373d413259a46990580e213a")) >> 128n;
  if ((absTick & BigInt("0x4")) != 0n)
    ratio = (ratio * BigInt("0xfff2e50f5f656932ef12357cf3c7fdcc")) >> 128n;
  if ((absTick & BigInt("0x8")) != 0n)
    ratio = (ratio * BigInt("0xffe5caca7e10e4e61c3624eaa0941cd0")) >> 128n;
  if ((absTick & BigInt("0x10")) != 0n)
    ratio = (ratio * BigInt("0xffcb9843d60f6159c9db58835c926644")) >> 128n;
  if ((absTick & BigInt("0x20")) != 0n)
    ratio = (ratio * BigInt("0xff973b41fa98c081472e6896dfb254c0")) >> 128n;
  if ((absTick & BigInt("0x40")) != 0n)
    ratio = (ratio * BigInt("0xff2ea16466c96a3843ec78b326b52861")) >> 128n;
  if ((absTick & BigInt("0x80")) != 0n)
    ratio = (ratio * BigInt("0xfe5dee046a99a2a811c461f1969c3053")) >> 128n;
  if ((absTick & BigInt("0x100")) != 0n)
    ratio = (ratio * BigInt("0xfcbe86c7900a88aedcffc83b479aa3a4")) >> 128n;
  if ((absTick & BigInt("0x200")) != 0n)
    ratio = (ratio * BigInt("0xf987a7253ac413176f2b074cf7815e54")) >> 128n;
  if ((absTick & BigInt("0x400")) != 0n)
    ratio = (ratio * BigInt("0xf3392b0822b70005940c7a398e4b70f3")) >> 128n;
  if ((absTick & BigInt("0x800")) != 0n)
    ratio = (ratio * BigInt("0xe7159475a2c29b7443b29c7fa6e889d9")) >> 128n;
  if ((absTick & BigInt("0x1000")) != 0n)
    ratio = (ratio * BigInt("0xd097f3bdfd2022b8845ad8f792aa5825")) >> 128n;
  if ((absTick & BigInt("0x2000")) != 0n)
    ratio = (ratio * BigInt("0xa9f746462d870fdf8a65dc1f90e061e5")) >> 128n;
  if ((absTick & BigInt("0x4000")) != 0n)
    ratio = (ratio * BigInt("0x70d869a156d2a1b890bb3df62baf32f7")) >> 128n;
  if ((absTick & BigInt("0x8000")) != 0n)
    ratio = (ratio * BigInt("0x31be135f97d08fd981231505542fcfa6")) >> 128n;
  if ((absTick & BigInt("0x10000")) != 0n)
    ratio = (ratio * BigInt("0x9aa508b5b7a84e1c677de54f3e99bc9")) >> 128n;
  if ((absTick & BigInt("0x20000")) != 0n)
    ratio = (ratio * BigInt("0x5d6af8dedb81196699c329225ee604")) >> 128n;
  if ((absTick & BigInt("0x40000")) != 0n)
    ratio = (ratio * BigInt("0x2216e584f5fa1ea926041bedfe98")) >> 128n;
  if ((absTick & BigInt("0x80000")) != 0n)
    ratio = (ratio * BigInt("0x48a170391f7dc42444e8fa2")) >> 128n;

  if (tick > 0) ratio = maxUint256 / ratio;

  // this divides by 1<<32 rounding up to go from a Q128.128 to a Q128.96.
  // we then downcast because we know the result always fits within 160 bits due to our tick input constraint
  // we round up in the division so getTickAtSqrtRatio of the output price is always consistent
  return (ratio >> 32n) + (ratio % (1n << 32n) == 0n ? 0n : 1n);
}

module.exports = {
  getAmount0ForLiquidity,
  getAmount1ForLiquidity,
  getAmountsForLiquidity,
  getSqrtRatioAtTick,
};

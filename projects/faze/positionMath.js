// Integer Q96 position valuation; TickMath constants from verified Uniswap v4 source.
const multipliers = [["1", "0xfffcb933bd6fad37aa2d162d1a594001"], ["0x2", "0xfff97272373d413259a46990580e213a"], ["0x4", "0xfff2e50f5f656932ef12357cf3c7fdcc"], ["0x8", "0xffe5caca7e10e4e61c3624eaa0941cd0"], ["0x10", "0xffcb9843d60f6159c9db58835c926644"], ["0x20", "0xff973b41fa98c081472e6896dfb254c0"], ["0x40", "0xff2ea16466c96a3843ec78b326b52861"], ["0x80", "0xfe5dee046a99a2a811c461f1969c3053"], ["0x100", "0xfcbe86c7900a88aedcffc83b479aa3a4"], ["0x200", "0xf987a7253ac413176f2b074cf7815e54"], ["0x400", "0xf3392b0822b70005940c7a398e4b70f3"], ["0x800", "0xe7159475a2c29b7443b29c7fa6e889d9"], ["0x1000", "0xd097f3bdfd2022b8845ad8f792aa5825"], ["0x2000", "0xa9f746462d870fdf8a65dc1f90e061e5"], ["0x4000", "0x70d869a156d2a1b890bb3df62baf32f7"], ["0x8000", "0x31be135f97d08fd981231505542fcfa6"], ["0x10000", "0x9aa508b5b7a84e1c677de54f3e99bc9"], ["0x20000", "0x5d6af8dedb81196699c329225ee604"], ["0x40000", "0x2216e584f5fa1ea926041bedfe98"], ["0x80000", "0x48a170391f7dc42444e8fa2"]].map(([a,b]) => [BigInt(a),BigInt(b)]);
function sqrtTick(t) {
  if (!Number.isInteger(t) || Math.abs(t)>887272) throw Error('Invalid tick');
  let ratio=1n<<128n, a=BigInt(Math.abs(t));
  for (const [mask,m] of multipliers) if (a&mask) ratio=ratio*m>>128n;
  if (t>0) ratio=((1n<<256n)-1n)/ratio;
  return (ratio>>32n)+(ratio% (1n<<32n)?1n:0n);
}
function quoteAmount(liquidity,price,lo,hi,quoteIs0) {
  const A=sqrtTick(lo), B=sqrtTick(hi), P=price<A?A:price>B?B:price, Q=1n<<96n;
  if (A>=B || liquidity<0n || price<=0n) throw Error('Invalid position');
  return quoteIs0 ? liquidity*Q*(B-P)/B/P : liquidity*(P-A)/Q;
}

module.exports = { quoteAmount };

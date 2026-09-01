const BN = require("bn.js");
const BigNumber = require("bignumber.js");

const ZERO = new BN(0)

const ONE = new BN(1)

const TWO = new BN(2)

const U128 = TWO.pow(new BN(128))

const U64_MAX = TWO.pow(new BN(64)).sub(ONE)

const U128_MAX = TWO.pow(new BN(128)).sub(ONE)

/**
 * @category MathUtil
 */
class MathUtil {
  static toX64BN(num) {
    return num.mul(new BN(2).pow(new BN(64)))
  }

  static fromX64BN(num) {
    return num.div(new BN(2).pow(new BN(64)))
  }

  static divRoundUp(n0, n1) {
    const hasRemainder = !n0.mod(n1).eq(ZERO)
    if (hasRemainder) {
      return n0.div(n1).add(new BN(1))
    }
    return n0.div(n1)
  }

  static sign(v) {
    const signBit = v.testn(127) ? 1 : 0
    return signBit
  }

  static is_neg(v) {
    return this.sign(v) === 1
  }

  static abs_u128(v) {
    if (v.gt(ZERO)) {
      return v
    }
    return this.u128Neg(v.subn(1))
  }

  static u128Neg(v) {
    return v.uxor(new BN('ffffffffffffffffffffffffffffffff', 16))
  }

  static neg(v) {
    if (this.is_neg(v)) {
      return v.abs()
    }
    return this.negFrom(v)
  }

  static abs(v) {
    if (this.sign(v) === 0) {
      return v
    }
    return this.u128Neg(v.sub(new BN(1)))
  }

  static negFrom(v) {
    if (v.eq(ZERO)) {
      return v
    }
    return this.u128Neg(v).add(new BN(1)).or(new BN(1).shln(127))
  }

  static u64ToRatio(values) {
    return new BigNumber(values).div(new BigNumber(2).pow(new BigNumber(64)))
  }

  static getPriceFromSqrtPrice(sqrtPrice, decimalA, decimalB) {
    const a2bPrice = MathUtil.u64ToRatio(sqrtPrice).pow(2)
    return a2bPrice.div(BigNumber(10).pow(BigNumber(decimalA - decimalB)))
  }
}

module.exports = {
  ZERO,
  ONE,
  TWO,
  U128,
  U64_MAX,
  U128_MAX,
  MathUtil
};
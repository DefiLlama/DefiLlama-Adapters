const {sliceIntoChunks} = require("../helper/utils");
const http = require("../helper/http");
const {endpoint, call} = require("../helper/chain/sui");
const BN = require("bn.js");
const {MathUtil} = require("./math");
const {TickMath} = require("./tickMath");
const BigNumber = require("bignumber.js");
const sui = require("../helper/chain/sui");

async function getObjects(objectIds) {
  if (objectIds.length > 9) {
    const chunks = sliceIntoChunks(objectIds, 9)
    const res = []
    for (const chunk of chunks) res.push(...(await getObjects(chunk)))
    return res
  }

  const result = await call('sui_multiGetObjects', [objectIds, {
    "showOwner": true,
  }], { withMetadata: true })
  // console.log('getObjects result:', result)
  // const {
  //   result
  // } = await http.post(endpoint(), {
  //   jsonrpc: "2.0", id: 1, method: 'sui_multiGetObjects', params: [objectIds, {
  //     "showType": true,
  //     "showOwner": true,
  //     "showContent": true,
  //   }],
  // })
  return objectIds.map(i => result.find(j => j.data?.objectId === i))
}

function getCoinAmountFromLiquidity(
  liquidity,
  cur_sqrt_price,
  lower_sqrt_price,
  upper_sqrt_price,
) {
  const liq = new BN(liquidity.toString())
  const cur_sqrt_price_str = new BN(cur_sqrt_price.toString())
  const lower_price_str = new BN(lower_sqrt_price.toString())
  const upper_price_str = new BN(upper_sqrt_price.toString())
  let coin_a
  let coin_b
  if (cur_sqrt_price_str.lt(lower_price_str)) {
    coin_a = MathUtil.toX64BN(liq).mul(upper_price_str.sub(lower_price_str)).div(lower_price_str.mul(upper_price_str))
    coin_b = new BN(0)
  } else if (cur_sqrt_price_str.lt(upper_price_str)) {
    coin_a = MathUtil.toX64BN(liq).mul(upper_price_str.sub(cur_sqrt_price_str)).div(cur_sqrt_price_str.mul(upper_price_str))

    coin_b = MathUtil.fromX64BN(liq.mul(cur_sqrt_price_str.sub(lower_price_str)))
  } else {
    coin_a = new BN(0)
    coin_b = MathUtil.fromX64BN(liq.mul(upper_price_str.sub(lower_price_str)))
  }
  return {
    coin_amount_a: coin_a.toString(),
    coin_amount_b: coin_b.toString(),
  }
}

function getCoinBAmountFromLiquidity(
  liquidity,
  pool_liquidity,
  cur_sqrt_price,
  decimal_a,
  decimal_b,
  reserve_x,
  reserve_y
) {
  const priceFromSqrtPrice = MathUtil.getPriceFromSqrtPrice(cur_sqrt_price, decimal_a, decimal_b);
  const pool_amount_y = BigNumber(reserve_y).plus(priceFromSqrtPrice.times(reserve_x));
  return BigNumber(liquidity).div(BigNumber(pool_liquidity)).times(pool_amount_y).toFixed(0);
}

function asIntN(int, bits = 32) {
  return Number(BigInt.asIntN(bits, BigInt(int)))
}

async function getVaultTvlByAmountB(vault) {
  const clmmPoolId = vault.fields.clmm_pool_id;

  const pool = await sui.getObject(clmmPoolId);
  const position = await sui.getDynamicFieldObject(
    vault.fields.id.id, [112,111,115,105,116,105,111,110], {idType: "vector<u8>"});


  const sqrtPrice = pool.fields.sqrt_price;
  const liquidity = position.fields.value.fields.liquidity;
  const lowerBits = position.fields.value.fields.tick_lower_index.fields.bits;
  const upperBits = position.fields.value.fields.tick_upper_index.fields.bits;
  const decimalsA = vault.fields.decimals_a;
  const decimalsB = vault.fields.decimals_b;

  const amount = getCoinAmountFromLiquidity(
    liquidity,
    sqrtPrice,
    TickMath.tickIndexToSqrtPriceX64(asIntN(BigInt(lowerBits))),
    TickMath.tickIndexToSqrtPriceX64(asIntN(BigInt(upperBits)))
  );

  return BigNumber(amount.coin_amount_a).times(
    MathUtil.getPriceFromSqrtPrice(sqrtPrice, decimalsA, decimalsB)
  ).plus(amount.coin_amount_b).toFixed(0)
}

module.exports = {
  getObjects,
  getVaultTvlByAmountB,
}
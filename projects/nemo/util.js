const {sliceIntoChunks} = require("../helper/utils");
const BN = require("bn.js");
const {MathUtil} = require("./math");
const {tickIndexToSqrtPriceX64} = require("../helper/utils/tick");
const BigNumber = require("bignumber.js");
const sui = require("../helper/chain/sui");

async function getObjects(objectIds) {
  const objects = []
  for (const objectId of objectIds) {
    const initial_shared_version = await sui.getInitialSharedVersion(objectId)
    objects.push({ data: { objectId, owner: { Shared: { initial_shared_version } } } })
  }
  return objects
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
    tickIndexToSqrtPriceX64(asIntN(BigInt(lowerBits))),
    tickIndexToSqrtPriceX64(asIntN(BigInt(upperBits)))
  );

  return BigNumber(amount.coin_amount_a).times(
    MathUtil.getPriceFromSqrtPrice(sqrtPrice, decimalsA, decimalsB)
  ).plus(amount.coin_amount_b).toFixed(0)
}

async function getDynamicFieldObject(parent, id, { idType = '0x2::object::ID' } = {}) {
  const obj = await sui.getDynamicFieldObject(parent, id, { idType })
  return obj ? { content: obj } : null
}

module.exports = {
  getObjects,
  getVaultTvlByAmountB,
  getDynamicFieldObject
}
const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");
const BN = require("bn.js");
const BigNumber = require("bignumber.js");

BigNumber.config({
  DECIMAL_PLACES: 64,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-64, 64],
});

const BUCK =
  "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK";
const USDT = ADDRESSES.sui.USDT;
const USDC = ADDRESSES.sui.USDC;

const BUCKETUS_VAULT_ID =
  "0x1a0b93fd2965ce3ceb4039c90b232ddee7b0e79015cab0ca10528bb5f4285188";
const BUCK_USDC_POOL_ID =
  "0x6ecf6d01120f5f055f9a605b56fd661412a81ec7c8b035255e333c664a0c12e7";

const CETABLE_VAULT_ID =
  "0xeed4e7948f88f1f044b653717a7855eef6fe188e9cbbb103d5169f9bc3edd257";
const USDC_USDT_POOL_ID =
  "0xc8d7a1503dc2f9f5b05449a87d8733593e2f0f3e7bffd90541252782e4d2ca20";

function asIntN(int, bits = 32) {
  return Number(BigInt.asIntN(bits, BigInt(int)));
}

function signedShiftRight(n0, shiftBy, bitWidth) {
  const twoN0 = n0.toTwos(bitWidth).shrn(shiftBy);
  twoN0.imaskn(bitWidth - shiftBy + 1);
  return twoN0.fromTwos(bitWidth - shiftBy);
}

function tickIndexToSqrtPricePositive(tick) {
  let ratio;

  if ((tick & 1) !== 0) {
    ratio = new BN("79232123823359799118286999567");
  } else {
    ratio = new BN("79228162514264337593543950336");
  }

  if ((tick & 2) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79236085330515764027303304731")),
      96,
      256
    );
  }
  if ((tick & 4) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79244008939048815603706035061")),
      96,
      256
    );
  }
  if ((tick & 8) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79259858533276714757314932305")),
      96,
      256
    );
  }
  if ((tick & 16) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79291567232598584799939703904")),
      96,
      256
    );
  }
  if ((tick & 32) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79355022692464371645785046466")),
      96,
      256
    );
  }
  if ((tick & 64) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79482085999252804386437311141")),
      96,
      256
    );
  }
  if ((tick & 128) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79736823300114093921829183326")),
      96,
      256
    );
  }
  if ((tick & 256) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("80248749790819932309965073892")),
      96,
      256
    );
  }
  if ((tick & 512) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("81282483887344747381513967011")),
      96,
      256
    );
  }
  if ((tick & 1024) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("83390072131320151908154831281")),
      96,
      256
    );
  }
  if ((tick & 2048) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("87770609709833776024991924138")),
      96,
      256
    );
  }
  if ((tick & 4096) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("97234110755111693312479820773")),
      96,
      256
    );
  }
  if ((tick & 8192) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("119332217159966728226237229890")),
      96,
      256
    );
  }
  if ((tick & 16384) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("179736315981702064433883588727")),
      96,
      256
    );
  }
  if ((tick & 32768) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("407748233172238350107850275304")),
      96,
      256
    );
  }
  if ((tick & 65536) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("2098478828474011932436660412517")),
      96,
      256
    );
  }
  if ((tick & 131072) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("55581415166113811149459800483533")),
      96,
      256
    );
  }
  if ((tick & 262144) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("38992368544603139932233054999993551")),
      96,
      256
    );
  }

  return signedShiftRight(ratio, 32, 256);
}

function tickIndexToSqrtPriceNegative(tickIndex) {
  const tick = Math.abs(tickIndex);
  let ratio;

  if ((tick & 1) !== 0) {
    ratio = new BN("18445821805675392311");
  } else {
    ratio = new BN("18446744073709551616");
  }

  if ((tick & 2) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18444899583751176498")),
      64,
      256
    );
  }
  if ((tick & 4) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18443055278223354162")),
      64,
      256
    );
  }
  if ((tick & 8) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18439367220385604838")),
      64,
      256
    );
  }
  if ((tick & 16) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18431993317065449817")),
      64,
      256
    );
  }
  if ((tick & 32) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18417254355718160513")),
      64,
      256
    );
  }
  if ((tick & 64) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18387811781193591352")),
      64,
      256
    );
  }
  if ((tick & 128) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18329067761203520168")),
      64,
      256
    );
  }
  if ((tick & 256) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18212142134806087854")),
      64,
      256
    );
  }
  if ((tick & 512) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("17980523815641551639")),
      64,
      256
    );
  }
  if ((tick & 1024) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("17526086738831147013")),
      64,
      256
    );
  }
  if ((tick & 2048) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("16651378430235024244")),
      64,
      256
    );
  }
  if ((tick & 4096) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("15030750278693429944")),
      64,
      256
    );
  }
  if ((tick & 8192) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("12247334978882834399")),
      64,
      256
    );
  }
  if ((tick & 16384) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN("8131365268884726200")), 64, 256);
  }
  if ((tick & 32768) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN("3584323654723342297")), 64, 256);
  }
  if ((tick & 65536) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN("696457651847595233")), 64, 256);
  }
  if ((tick & 131072) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN("26294789957452057")), 64, 256);
  }
  if ((tick & 262144) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN("37481735321082")), 64, 256);
  }

  return ratio;
}

function tickIndexToSqrtPriceX64(tickIndex) {
  if (tickIndex > 0) {
    return new BN(tickIndexToSqrtPricePositive(tickIndex));
  }
  return new BN(tickIndexToSqrtPriceNegative(tickIndex));
}

function toX64_Decimal(num) {
  return num.multipliedBy(BigNumber(2).pow(64));
}

function fromX64_Decimal(num) {
  return num.multipliedBy(BigNumber(2).pow(-64));
}

function getCoinAmountFromLiquidity(
  liquidity,
  curSqrtPrice,
  lowerSqrtPrice,
  upperSqrtPrice
) {
  const liq = new BigNumber(liquidity.toString());
  const curSqrtPriceStr = new BigNumber(curSqrtPrice.toString());
  const lowerPriceStr = new BigNumber(lowerSqrtPrice.toString());
  const upperPriceStr = new BigNumber(upperSqrtPrice.toString());
  let coinA;
  let coinB;
  if (curSqrtPrice.lt(lowerSqrtPrice)) {
    coinA = toX64_Decimal(liq)
      .multipliedBy(upperPriceStr.minus(lowerPriceStr))
      .div(lowerPriceStr.multipliedBy(upperPriceStr));
    coinB = new BigNumber(0);
  } else if (curSqrtPrice.lt(upperSqrtPrice)) {
    coinA = toX64_Decimal(liq)
      .multipliedBy(upperPriceStr.minus(curSqrtPriceStr))
      .div(curSqrtPriceStr.multipliedBy(upperPriceStr));

    coinB = fromX64_Decimal(
      liq.multipliedBy(curSqrtPriceStr.minus(lowerPriceStr))
    );
  } else {
    coinA = new BigNumber(0);
    coinB = fromX64_Decimal(
      liq.multipliedBy(upperPriceStr.minus(lowerPriceStr))
    );
  }

  return {
    coinA: new BN(coinA.toFixed(0, 2)),
    coinB: new BN(coinB.toFixed(0, 2)),
  };
}

async function tvl(_, _1, _2, { api }) {
  const bucketusVaultObjs = await sui.getObject(BUCKETUS_VAULT_ID);
  const bucketusPoolObjs = await sui.getObject(BUCK_USDC_POOL_ID);

  const bucketusPool = bucketusPoolObjs.fields;
  const bucketusPosition = bucketusVaultObjs.fields.position.fields;
  let curSqrtPrice = new BN(bucketusPool.current_sqrt_price);

  let lowerSqrtPrice = tickIndexToSqrtPriceX64(
    asIntN(BigInt(bucketusPosition.tick_lower_index.fields.bits))
  );
  let upperSqrtPrice = tickIndexToSqrtPriceX64(
    asIntN(BigInt(bucketusPosition.tick_upper_index.fields.bits))
  );

  const bucketusCointAmounts = getCoinAmountFromLiquidity(
    new BN(Number(bucketusPosition.liquidity)),
    curSqrtPrice,
    lowerSqrtPrice,
    upperSqrtPrice
  );

  api.add(BUCK, bucketusCointAmounts.coinA);
  api.add(USDC, bucketusCointAmounts.coinB);

  const cetableVaultObjs = await sui.getObject(CETABLE_VAULT_ID);
  const cetablePoolObjs = await sui.getObject(USDC_USDT_POOL_ID);

  const cetablePool = cetablePoolObjs.fields;
  const cetablePosition = cetableVaultObjs.fields.position.fields;

  curSqrtPrice = new BN(cetablePool.current_sqrt_price);

  lowerSqrtPrice = tickIndexToSqrtPriceX64(
    asIntN(BigInt(cetablePosition.tick_lower_index.fields.bits))
  );
  upperSqrtPrice = tickIndexToSqrtPriceX64(
    asIntN(BigInt(cetablePosition.tick_upper_index.fields.bits))
  );

  const cetableCointAmounts = getCoinAmountFromLiquidity(
    new BN(cetablePosition.liquidity),
    curSqrtPrice,
    lowerSqrtPrice,
    upperSqrtPrice,
    true
  );

  api.add(USDT, cetableCointAmounts.coinA);
  api.add(USDC, cetableCointAmounts.coinB);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};

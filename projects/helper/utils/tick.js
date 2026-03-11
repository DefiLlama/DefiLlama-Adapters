
const import_bn6 = require("bn.js");


const tickToPrice = (tick) => {
  const response = Math.pow(1.0001, tick)

  if (response === Infinity)
    return tickToPriceBN(tick)
  
  return response
}

function tickToPriceBN(tick) {
  const sqrtPrice = tickIndexToSqrtPriceX64(tick) / 2 ** 64;
  return Math.pow(sqrtPrice, 2);
}

function signedShiftRight(n0, shiftBy, bitWidth) {
  const twoN0 = n0.toTwos(bitWidth).shrn(shiftBy);
  twoN0.imaskn(bitWidth - shiftBy + 1);
  return twoN0.fromTwos(bitWidth - shiftBy);
}

function tickIndexToSqrtPricePositive(tick) {
  let ratio;
  if ((tick & 1) !== 0) {
    ratio = new import_bn6("79232123823359799118286999567");
  } else {
    ratio = new import_bn6("79228162514264337593543950336");
  }
  if ((tick & 2) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("79236085330515764027303304731")), 96, 256);
  }
  if ((tick & 4) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("79244008939048815603706035061")), 96, 256);
  }
  if ((tick & 8) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("79259858533276714757314932305")), 96, 256);
  }
  if ((tick & 16) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("79291567232598584799939703904")), 96, 256);
  }
  if ((tick & 32) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("79355022692464371645785046466")), 96, 256);
  }
  if ((tick & 64) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("79482085999252804386437311141")), 96, 256);
  }
  if ((tick & 128) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("79736823300114093921829183326")), 96, 256);
  }
  if ((tick & 256) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("80248749790819932309965073892")), 96, 256);
  }
  if ((tick & 512) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("81282483887344747381513967011")), 96, 256);
  }
  if ((tick & 1024) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("83390072131320151908154831281")), 96, 256);
  }
  if ((tick & 2048) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("87770609709833776024991924138")), 96, 256);
  }
  if ((tick & 4096) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("97234110755111693312479820773")), 96, 256);
  }
  if ((tick & 8192) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("119332217159966728226237229890")), 96, 256);
  }
  if ((tick & 16384) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("179736315981702064433883588727")), 96, 256);
  }
  if ((tick & 32768) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("407748233172238350107850275304")), 96, 256);
  }
  if ((tick & 65536) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("2098478828474011932436660412517")), 96, 256);
  }
  if ((tick & 131072) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("55581415166113811149459800483533")), 96, 256);
  }
  if ((tick & 262144) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("38992368544603139932233054999993551")), 96, 256);
  }
  return signedShiftRight(ratio, 32, 256);
}

function tickIndexToSqrtPriceNegative(tickIndex) {
  const tick = Math.abs(tickIndex);
  let ratio;
  if ((tick & 1) !== 0) {
    ratio = new import_bn6("18445821805675392311");
  } else {
    ratio = new import_bn6("18446744073709551616");
  }
  if ((tick & 2) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("18444899583751176498")), 64, 256);
  }
  if ((tick & 4) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("18443055278223354162")), 64, 256);
  }
  if ((tick & 8) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("18439367220385604838")), 64, 256);
  }
  if ((tick & 16) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("18431993317065449817")), 64, 256);
  }
  if ((tick & 32) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("18417254355718160513")), 64, 256);
  }
  if ((tick & 64) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("18387811781193591352")), 64, 256);
  }
  if ((tick & 128) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("18329067761203520168")), 64, 256);
  }
  if ((tick & 256) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("18212142134806087854")), 64, 256);
  }
  if ((tick & 512) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("17980523815641551639")), 64, 256);
  }
  if ((tick & 1024) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("17526086738831147013")), 64, 256);
  }
  if ((tick & 2048) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("16651378430235024244")), 64, 256);
  }
  if ((tick & 4096) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("15030750278693429944")), 64, 256);
  }
  if ((tick & 8192) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("12247334978882834399")), 64, 256);
  }
  if ((tick & 16384) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("8131365268884726200")), 64, 256);
  }
  if ((tick & 32768) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("3584323654723342297")), 64, 256);
  }
  if ((tick & 65536) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("696457651847595233")), 64, 256);
  }
  if ((tick & 131072) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("26294789957452057")), 64, 256);
  }
  if ((tick & 262144) !== 0) {
    ratio = signedShiftRight(ratio.mul(new import_bn6("37481735321082")), 64, 256);
  }
  return ratio;
}

function tickIndexToSqrtPriceX64(tickIndex) {
  if (tickIndex > 0) {
    return new import_bn6(tickIndexToSqrtPricePositive(tickIndex));
  }
  return new import_bn6(tickIndexToSqrtPriceNegative(tickIndex));
}


function asIntN(int, bits = 32) {
  return Number(BigInt.asIntN(bits, BigInt(int)));
}

function i32BitsToNumber(v) {
  return asIntN(BigInt(v), 32);
}

module.exports = {
  tickToPrice,
  i32BitsToNumber,
}
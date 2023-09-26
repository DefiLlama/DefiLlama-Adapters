const BN = require("bn.js");
const BigNumber = require("bignumber.js");
const { ArmadaIDL, WhirpoolIDL } = require("./idl");
const { getProvider, sumTokens2 } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");

async function tvl() {
  const anchorProvider = getProvider();
  const programId = new PublicKey(
    "ArmN3Av2boBg8pkkeCK9UuCN9zSUVc2UQg1qR2sKwm8d"
  );
  const armadaProgram = new Program(ArmadaIDL, programId, anchorProvider);

  const whirlpoolProgram = new Program(
    WhirpoolIDL,
    new PublicKey("whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"),
    anchorProvider
  );

  // Load all the vaults in the program
  const vaults = await armadaProgram.account.clpVault.all();
  // Load all the TokenAccounts for the vaults
  const vaultTokenAccounts = [];
  const vaultMap = {};
  const whirlpoolKeys = [];
  const positionKeys = [];
  vaults.forEach((vault) => {
    vaultTokenAccounts.push(vault.account.tokenVaultA);
    vaultTokenAccounts.push(vault.account.tokenVaultB);
    whirlpoolKeys.push(vault.account.clp);
    vault.account.positions.forEach((position) => {
      if (position.positionKey.toString() !== PublicKey.default.toString()) {
        positionKeys.push(position.positionKey);
      }
    });
    vaultMap[vault.publicKey.toString()] = vault;
  });
  // Load all the Positions for the vaults
  const [positions, whirlpools] = await Promise.all([
    whirlpoolProgram.account.position.fetchMultiple(positionKeys),
    whirlpoolProgram.account.whirlpool.fetchMultiple(whirlpoolKeys),
  ]);
  const whirlpoolMap = whirlpools.reduce((agg, cur, index) => {
    agg[whirlpoolKeys[index].toString()] = cur;
    return agg;
  }, {});
  // Convert Positions to token amounts
  const balances = {};
  positions.forEach((position) => {
    const whirlpool = whirlpoolMap[position.whirlpool.toString()];
    const sqrtPriceLowerX64 = tickIndexToSqrtPriceX64(position.tickLowerIndex);
    const sqrtPriceUpperX64 = tickIndexToSqrtPriceX64(position.tickUpperIndex);
    const { tokenA, tokenB } = getTokenAmountsFromLiquidity(
      position.liquidity,
      whirlpool.sqrtPrice,
      sqrtPriceLowerX64,
      sqrtPriceUpperX64,
      true
    );
    const balanceKeyA = `solana:${whirlpool.tokenMintA.toString()}`;
    const balanceKeyB = `solana:${whirlpool.tokenMintB.toString()}`;
    const prevBalanceA = balances[balanceKeyA];
    const prevBalanceB = balances[balanceKeyB];
    balances[balanceKeyA] = prevBalanceA ? prevBalanceA.add(tokenA) : tokenA;
    balances[balanceKeyB] = prevBalanceB ? prevBalanceB.add(tokenB) : tokenB;
  });
  Object.keys(balances).forEach((key) => {
    balances[key] = balances[key].toString()
  })
  return sumTokens2({
    tokenAccounts: vaultTokenAccounts,
    balances,
  });
}

const tickIndexToSqrtPriceX64 = (tickIndex) => {
  if (tickIndex > 0) {
    return new BN(tickIndexToSqrtPricePositive(tickIndex));
  } else {
    return new BN(tickIndexToSqrtPriceNegative(tickIndex));
  }
};

function tickIndexToSqrtPricePositive(tick) {
  let ratio;

  if ((tick & 1) != 0) {
    ratio = new BN("79232123823359799118286999567");
  } else {
    ratio = new BN("79228162514264337593543950336");
  }

  if ((tick & 2) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79236085330515764027303304731")),
      96,
      256
    );
  }
  if ((tick & 4) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79244008939048815603706035061")),
      96,
      256
    );
  }
  if ((tick & 8) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79259858533276714757314932305")),
      96,
      256
    );
  }
  if ((tick & 16) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79291567232598584799939703904")),
      96,
      256
    );
  }
  if ((tick & 32) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79355022692464371645785046466")),
      96,
      256
    );
  }
  if ((tick & 64) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79482085999252804386437311141")),
      96,
      256
    );
  }
  if ((tick & 128) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79736823300114093921829183326")),
      96,
      256
    );
  }
  if ((tick & 256) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("80248749790819932309965073892")),
      96,
      256
    );
  }
  if ((tick & 512) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("81282483887344747381513967011")),
      96,
      256
    );
  }
  if ((tick & 1024) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("83390072131320151908154831281")),
      96,
      256
    );
  }
  if ((tick & 2048) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("87770609709833776024991924138")),
      96,
      256
    );
  }
  if ((tick & 4096) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("97234110755111693312479820773")),
      96,
      256
    );
  }
  if ((tick & 8192) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("119332217159966728226237229890")),
      96,
      256
    );
  }
  if ((tick & 16384) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("179736315981702064433883588727")),
      96,
      256
    );
  }
  if ((tick & 32768) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("407748233172238350107850275304")),
      96,
      256
    );
  }
  if ((tick & 65536) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("2098478828474011932436660412517")),
      96,
      256
    );
  }
  if ((tick & 131072) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("55581415166113811149459800483533")),
      96,
      256
    );
  }
  if ((tick & 262144) != 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("38992368544603139932233054999993551")),
      96,
      256
    );
  }

  return signedShiftRight(ratio, 32, 256);
}

function tickIndexToSqrtPriceNegative(tickIndex) {
  let tick = Math.abs(tickIndex);
  let ratio;

  if ((tick & 1) != 0) {
    ratio = new BN("18445821805675392311");
  } else {
    ratio = new BN("18446744073709551616");
  }

  if ((tick & 2) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18444899583751176498")), 64, 256);
  }
  if ((tick & 4) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18443055278223354162")), 64, 256);
  }
  if ((tick & 8) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18439367220385604838")), 64, 256);
  }
  if ((tick & 16) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18431993317065449817")), 64, 256);
  }
  if ((tick & 32) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18417254355718160513")), 64, 256);
  }
  if ((tick & 64) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18387811781193591352")), 64, 256);
  }
  if ((tick & 128) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18329067761203520168")), 64, 256);
  }
  if ((tick & 256) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("18212142134806087854")), 64, 256);
  }
  if ((tick & 512) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("17980523815641551639")), 64, 256);
  }
  if ((tick & 1024) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("17526086738831147013")), 64, 256);
  }
  if ((tick & 2048) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("16651378430235024244")), 64, 256);
  }
  if ((tick & 4096) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("15030750278693429944")), 64, 256);
  }
  if ((tick & 8192) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("12247334978882834399")), 64, 256);
  }
  if ((tick & 16384) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("8131365268884726200")), 64, 256);
  }
  if ((tick & 32768) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("3584323654723342297")), 64, 256);
  }
  if ((tick & 65536) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("696457651847595233")), 64, 256);
  }
  if ((tick & 131072) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("26294789957452057")), 64, 256);
  }
  if ((tick & 262144) != 0) {
    ratio = signedShiftRight(ratio.mul(new BN("37481735321082")), 64, 256);
  }

  return ratio;
}

function signedShiftRight(n0, shiftBy, bitWidth) {
  let twoN0 = n0.toTwos(bitWidth).shrn(shiftBy);
  twoN0.imaskn(bitWidth - shiftBy + 1);
  return twoN0.fromTwos(bitWidth - shiftBy);
}

const getTokenAmountsFromLiquidity = (
  liquidity,
  currentSqrtPrice,
  lowerSqrtPrice,
  upperSqrtPrice,
  round_up
) => {
  const _liquidity = new BigNumber(liquidity.toString());
  const _currentPrice = new BigNumber(currentSqrtPrice.toString());
  const _lowerPrice = new BigNumber(lowerSqrtPrice.toString());
  const _upperPrice = new BigNumber(upperSqrtPrice.toString());
  let tokenA, tokenB;
  if (currentSqrtPrice.lt(lowerSqrtPrice)) {
    // x = L * (pb - pa) / (pa * pb)
    tokenA = toX64_Decimal(_liquidity)
      .times(_upperPrice.minus(_lowerPrice))
      .div(_lowerPrice.times(_upperPrice));
    tokenB = new BigNumber(0);
  } else if (currentSqrtPrice.lt(upperSqrtPrice)) {
    // x = L * (pb - p) / (p * pb)
    // y = L * (p - pa)
    tokenA = toX64_Decimal(_liquidity)
      .times(_upperPrice.minus(_currentPrice))
      .div(_currentPrice.times(_upperPrice));
    tokenB = fromX64_Decimal(_liquidity.times(_currentPrice.minus(_lowerPrice)));
  } else {
    // y = L * (pb - pa)
    tokenA = new BigNumber(0);
    tokenB = fromX64_Decimal(_liquidity.times(_upperPrice.minus(_lowerPrice)));
  }

  if (round_up) {
    return {
      tokenA: new BN(tokenA.integerValue(BigNumber.ROUND_CEIL).toString()),
      tokenB: new BN(tokenB.integerValue(BigNumber.ROUND_CEIL).toString()),
    };
  } else {
    return {
      tokenA: new BN(tokenA.integerValue(BigNumber.ROUND_FLOOR).toString()),
      tokenB: new BN(tokenB.integerValue(BigNumber.ROUND_FLOOR).toString()),
    };
  }
};

const toX64_Decimal = (num) => {
  return num.times(new BigNumber(2).pow(64));
};

const fromX64_Decimal = (num) => {
  return num.times(new BigNumber(2).pow(-64));
};

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl,
  },
};

const BN = require("bn.js");
const BigNumber = require("bignumber.js");
const { ArmadaIDL } = require("./idl");
const { getProvider, sumTokens2 } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");

/** Need the following from Orca's SDK
 * PriceMath.tickIndexToSqrtPriceX64
 * PoolUtil.getTokenAmountsFromLiquidity
 * */

async function tvl() {
  const anchorProvider = getProvider();
  const programId = new PublicKey(
    "ArmN3Av2boBg8pkkeCK9UuCN9zSUVc2UQg1qR2sKwm8d"
  );
  const program = new Program(ArmadaIDL, programId, anchorProvider);
  // Load all the vaults in the program
  const vaults = await program.account.clpVault.all();
  console.log(`Retrieved ${vaults.length} vaults`);
  // Load all the TokenAccounts for the vaults
  const vaultTokenAccounts = [];
  vaults.forEach((vault) => {
    vaultTokenAccounts.push(vault.account.tokenVaultA);
    vaultTokenAccounts.push(vault.account.tokenVaultA);
  })
return sumTokens2({
  tokenAccounts: vaultTokenAccounts
})
  // TODO: Load all the Positions for the vaults
  // TODO: Convert Positions to token amounts
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
      .mul(_upperPrice.sub(_lowerPrice))
      .div(_lowerPrice.mul(_upperPrice));
    tokenB = new BigNumber(0);
  } else if (currentSqrtPrice.lt(upperSqrtPrice)) {
    // x = L * (pb - p) / (p * pb)
    // y = L * (p - pa)
    tokenA = toX64_Decimal(_liquidity)
      .mul(_upperPrice.sub(_currentPrice))
      .div(_currentPrice.mul(_upperPrice));
    tokenB = fromX64_Decimal(_liquidity.mul(_currentPrice.sub(_lowerPrice)));
  } else {
    // y = L * (pb - pa)
    tokenA = new BigNumber(0);
    tokenB = fromX64_Decimal(_liquidity.mul(_upperPrice.sub(_lowerPrice)));
  }

  if (round_up) {
    return {
      tokenA: new BN(tokenA.ceil().toString()),
      tokenB: new BN(tokenB.ceil().toString()),
    };
  } else {
    return {
      tokenA: new BN(tokenA.floor().toString()),
      tokenB: new BN(tokenB.floor().toString()),
    };
  }
};

const toX64_Decimal = (num) => {
  return num.mul(new BigNumber(2).pow(64));
};

const fromX64_Decimal = (num) => {
  return num.mul(new BigNumber(2).pow(-64));
};

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl,
  },
};

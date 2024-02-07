const { POOL_MANAGER_APP_ID } = require("./constants");
const {
  getAppState,
  getParsedValueFromState,
  unixTime,
  mulScale,
  ONE_16_DP,
  SECONDS_IN_YEAR,
  expBySquaring,
  fromIntToByteHex,
} = require("./utils");

function calcBorrowInterestIndex(birt1, biit1, latestUpdate) {
  const dt = BigInt(unixTime()) - latestUpdate;
  return mulScale(
    biit1,
    expBySquaring(ONE_16_DP + birt1 / SECONDS_IN_YEAR, dt, ONE_16_DP),
    ONE_16_DP
  );
}

function calcDepositInterestIndex(dirt1, diit1, latestUpdate) {
  const dt = BigInt(unixTime()) - latestUpdate;
  return mulScale(diit1, ONE_16_DP + (dirt1 * dt) / SECONDS_IN_YEAR, ONE_16_DP);
}

async function retrievePoolManagerInfo() {
  const state = await getAppState(POOL_MANAGER_APP_ID);
  if (state === undefined) throw Error("Could not find Pool Manager");

  const pools = {};
  for (let i = 0; i < 63; i++) {
    const poolBase64Value = String(
      getParsedValueFromState(state, fromIntToByteHex(i), "hex")
    );

    const poolValue = Buffer.from(poolBase64Value, "base64").toString("hex");

    for (let j = 0; j < 3; j++) {
      const basePos = j * 84;
      const poolAppId = Number("0x" + poolValue.slice(basePos, basePos + 12));

      // add pool
      if (poolAppId > 0) {
        const vbir = BigInt("0x" + poolValue.slice(basePos + 12, basePos + 28));
        const vbiit1 = BigInt(
          "0x" + poolValue.slice(basePos + 28, basePos + 44)
        );
        const dir = BigInt("0x" + poolValue.slice(basePos + 44, basePos + 60));
        const diit1 = BigInt(
          "0x" + poolValue.slice(basePos + 60, basePos + 76)
        );
        const lu = BigInt("0x" + poolValue.slice(basePos + 76, basePos + 84));

        const depositInterestIndex = calcDepositInterestIndex(dir, diit1, lu);
        const variableBorrowInterestIndex = calcBorrowInterestIndex(
          vbir,
          vbiit1,
          lu
        );

        pools[poolAppId] = {
          depositInterestIndex,
          variableBorrowInterestIndex,
        };
      }
    }
  }

  return { pools };
}

module.exports = {
  retrievePoolManagerInfo,
};

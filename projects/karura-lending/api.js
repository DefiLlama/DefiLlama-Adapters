
const { getKaruraAPI } = require('../helper/karura')
const lksmToKsm = require("../karura-staking/lksmToKsm.js");
// node test.js projects/karura-lending/index.js
async function tvl() {
  const api = await getKaruraAPI();

  // Query for all KSM positions, if there were multiple token positions
  // you could use loans.totalPositions.entries() to query them all at once
  const ksmPositions = await api.query.loans.totalPositions({ Token: "KSM" });
  const ksmTotalCollateral = Number(ksmPositions.toJSON().collateral);

  const lksmPositions = await api.query.loans.totalPositions({ Token: "LKSM" });
  const lksmTotalCollateral = Number(lksmPositions.toJSON().collateral);

  const karPositions = await api.query.loans.totalPositions({ Token: "KAR" });
  const karTotalCollateral = Number(karPositions.toJSON().collateral);

  const totalCollateral =
    ksmTotalCollateral + (await lksmToKsm(api, lksmTotalCollateral));

  return {
    kusama: Number(totalCollateral) / 1e12,
    karura: Number(karTotalCollateral) / 1e12,
  };
}

module.exports = {
  karura: { tvl },
};
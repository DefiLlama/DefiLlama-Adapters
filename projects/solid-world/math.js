const BigNumber = require("bignumber.js");
const SECONDS_IN_WEEK = 604800;
const DAYS_IN_YEAR = 365;

function computeTimeAppreciationDiscount(
  timeAppreciation,
  certificationDate
) {
  const yearsTillCertification = yearsBetween(certificationDate);
  if (yearsTillCertification === 0) {
    return 1;
  }

  // adjusting for 6 decimals
  const timeAppreciationPercentage = Number(timeAppreciation) / 1_000_000;
  return Math.pow(1 - timeAppreciationPercentage, yearsTillCertification);
}

function yearsBetween(
  endDate,
  startDate = new Date().getTime()
) {
  endDate = Number(endDate);

  if (endDate <= startDate) {
    return 0;
  }

  const diff = endDate - startDate;
  return toYears(Math.floor(diff / 1000));
}

function toYears(seconds) {
  const weeks = Math.floor(seconds / SECONDS_IN_WEEK);
  if (weeks === 0) {
    return 0;
  }

  const days = weeks * 7;

  return days / DAYS_IN_YEAR;
}


// creditsAmount * 10e18 * (1 - timeAppreciation) ** yearsTillCertification
function computeValuation({ creditsAmount, timeAppreciation, certificationDate }) {
  const timeAppreciationDiscount = computeTimeAppreciationDiscount(
    timeAppreciation,
    certificationDate
  );

  return BigNumber(creditsAmount)
    .times(BigNumber(10).pow(18))
    .times(timeAppreciationDiscount)
    .toFixed(0);
}

module.exports = {
  computeValuation
};

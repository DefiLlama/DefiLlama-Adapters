const {autopoolsMetaData} = require("./constants");

function mergeAndSum(obj1, obj2) {
  let result = {};

  new Set([...Object.keys(obj1), ...Object.keys(obj2)]).forEach((key) => {
    result[key] = (+obj1[key] || 0) + (+obj2[key] || 0);
  });

  return result;
}

function sumAutoPoolTokenXY(sums, response) {
  const { tokenX, tokenY } = autopoolsMetaData[response.input.target];
  const autopoolTokenXWithAvax = `avax:${tokenX.toLowerCase()}`;
  const autopoolTokenYWithAvax = `avax:${tokenY.toLowerCase()}`;
  const { amountX, amountY } = response.output;

  sums[autopoolTokenXWithAvax] = (sums[autopoolTokenXWithAvax] || 0) + +amountX;
  sums[autopoolTokenYWithAvax] = (sums[autopoolTokenYWithAvax] || 0) + +amountY;

  return sums;
}

module.exports = {
  mergeAndSum,
  sumAutoPoolTokenXY,
};
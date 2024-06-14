const { autopoolsMetaData } = require("./constants");

function sumAutoPoolTokenXY(api, response, target) {
  const { tokenX, tokenY } = autopoolsMetaData[target];
  const { amountX, amountY } = response;
  api.add(tokenX, amountX);
  api.add(tokenY, amountY);
}

module.exports = {
  sumAutoPoolTokenXY,
};
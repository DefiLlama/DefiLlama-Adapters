const { tvl } = require("./terra.js");

(async function () {
  console.log(await tvl());
})();

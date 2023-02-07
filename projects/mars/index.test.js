const { osmosis } = require("./index.js");

(async function () {
  console.log("querying osmosis tvl...");
  console.log(await osmosis.tvl());

  console.log("querying osmosis borrowed...");
  console.log(await osmosis.borrowed());
})();

const { mars, osmosis } = require("./index.js");

(async function () {
  console.log("querying mars tvl...");
  console.log(await mars.tvl());

  console.log("querying osmosis tvl...");
  console.log(await osmosis.tvl());

  console.log("querying osmosis borrowed...");
  console.log(await osmosis.borrowed());
})();

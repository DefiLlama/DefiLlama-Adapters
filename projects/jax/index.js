const { methodology, compoundExports2 } = require("../helper/compound");

module.exports = {
  taiko: compoundExports2({
    comptroller: "0x8D86d4070b9432863FE9522B2c931C410085E1d4",
    cether: "0xdc1Af71e6B9b4572Cdf7832496EfBEa06cBEcfc5",
  }),
  methodology,
};

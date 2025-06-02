const { compoundExports } = require("../helper/compound");

const comptroller = "0xdc21c1dAF3277f07fFA6EB09fCD3E07EDc36DC0A";

module.exports = {
  bsc: compoundExports(comptroller,
    "0x38e22c429e62530cbB59B90bF14a71346C727752",
  ),
  methodology:
    "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
};
module.exports.bsc.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 
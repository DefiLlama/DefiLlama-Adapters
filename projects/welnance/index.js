const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports } = require("../helper/compound");

const comptroller = "0xdc21c1dAF3277f07fFA6EB09fCD3E07EDc36DC0A";

module.exports = {
      bsc: {
    ...compoundExports( comptroller,
      "bsc",
      "0x38e22c429e62530cbB59B90bF14a71346C727752",
      ADDRESSES.bsc.WBNB
    ),
  },
  methodology:
    "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
};

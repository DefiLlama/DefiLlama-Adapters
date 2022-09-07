const { compoundExports } = require("../helper/compound");

const comptroller = "0xdc21c1dAF3277f07fFA6EB09fCD3E07EDc36DC0A";

module.exports = {
  timetravel: true,
  doublecounted: false,
  bsc: {
    ...compoundExports( comptroller,
      "bsc",
      "0x38e22c429e62530cbB59B90bF14a71346C727752",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
    ),
  },
  methodology:
    "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
};

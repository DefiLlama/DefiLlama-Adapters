const { aaveExports, methodology } = require("../helper/aave");

module.exports = {
  methodology,
  iotaevm: {
    ...aaveExports('iotaevm', '0xA9Bb7ebb4F51B0e0BbD0FaE640e32298a0Bcf4A5'),
  },
};

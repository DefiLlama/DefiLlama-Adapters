const { aaveExports } = require("../helper/aave");

const config = {
  taiko: {
    "addressProviderRegistry": "0x47EC2cEF8468dbaC060410E2BDde35A3B8f725e5",
    "poolDataProvider":"0x9E3D95b518f68349464da1b6dbd0B94DB59addc1",
  }
};

const data = {};
Object.keys(config).forEach((chain) => {
  data[chain] = aaveExports(chain, config[chain]["addressProviderRegistry"], undefined, [config[chain]["poolDataProvider"]]);
});


module.exports = data;
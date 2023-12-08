const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require("@defillama/sdk/build/abi/abi2");
const { sumTokensAccount } = require("../helper/chain/ton.js");

module.exports = {
  ton: {
    tvl: (_, _b, _c, { api, logArray }) =>
        sumTokensAccount({
            api,
            addr: "Ef-WMmizoLk4CvqTKs-mDrGJwW4fiH5zVd4SaHih7PObxP_0",
      }),
  },
};
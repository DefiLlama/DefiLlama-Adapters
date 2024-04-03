const ADDRESSES = require('../helper/coreAssets.json')
const {
  queryContract: queryContractCosmos,
} = require("../helper/chain/cosmos");

const config = {
  injective: {
    farms: [
      "inj1yjnm0d6lxpuk8a4eulnf80gcx954zcf8rq2sfp",
      "inj1lw5pd768ghux6dsux24tnqxlqz5pln6kk9rd6c",
    ],
  },
};

const usdtDenom = "peggy0xdAC17F958D2ee523a2206206994597C13D831ec7"

async function farm2Tvl(chain, contract, api) {
  const res = await queryContractCosmos({ chain, contract, data: { total_vaults_in_usdt: {} }, });
  api.add(usdtDenom, +res)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  };

Object.keys(config).forEach(chain => {
  const { farms } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      await Promise.all(farms.map(farm => farm2Tvl(chain, farm, api)))
      return api.getBalances()
    }
  }
})

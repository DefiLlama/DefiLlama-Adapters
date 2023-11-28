const { queryContract: queryContractCosmos } = require("../helper/chain/cosmos");
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  terra2: {
    token: ADDRESSES.terra2.LUNA,
    hub: "terra1l2nd99yze5fszmhl5svyh5fky9wm4nz4etlgnztfu4e8809gd52q04n3ea",
    boneToken: "terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml",
  },
  migaloo: {
    token: ADDRESSES.migaloo.WHALE,
    hub: "migaloo1mf6ptkssddfmxvhdx0ech0k03ktp6kf9yk59renau2gvht3nq2gqdhts4u",
    boneToken: "factory/migaloo1mf6ptkssddfmxvhdx0ech0k03ktp6kf9yk59renau2gvht3nq2gqdhts4u/boneWhale"
  },
  chihuahua: {
    token: ADDRESSES.chihuahua.HUAHUA,
    hub: "chihuahua1psf89r2g9vdlttrjphspcpzzfx87r2r4nl5fg703ky42mp2706wsw5330f",
    boneToken: "chihuahua1jz5n4aynhpxx7clf2m8hrv9dp5nz83k67fgaxhy4p9dfwl6zssrq3ymr6w"
  }
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Liquid Staking Protocol",
};

Object.keys(config).forEach(chain => {
  const { hub, token } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      if (!hub) return {}
      const { total_native } = await queryContractCosmos({ contract: hub, chain, data: { state: {} } });
      api.add(token, total_native)
      return api.getBalances()
    }
  }
})
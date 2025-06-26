const { queryContract: queryContractCosmos } = require("../helper/chain/cosmos");
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  archway: {
    token: ADDRESSES.archway.ARCH,
    hub: "archway12ejj99vkawuxfv0rg9l08hsun35juc6evprracmpe3mka3lsk5fqpjxhgl",
    boneToken: "archway12yurzx8zynv3ck7uh4tucre48tqsm4fac4hfk9p3l24qs2cn08dqr684cg"
  },
  chihuahua: {
    token: ADDRESSES.chihuahua.HUAHUA,
    hub: "chihuahua1psf89r2g9vdlttrjphspcpzzfx87r2r4nl5fg703ky42mp2706wsw5330f",
    boneToken: "chihuahua1jz5n4aynhpxx7clf2m8hrv9dp5nz83k67fgaxhy4p9dfwl6zssrq3ymr6w"
  },
  injective: {
    token: ADDRESSES.injective.INJ,
    hub: "inj1dxp690rd86xltejgfq2fa7f2nxtgmm5cer3hvu",
    boneToken: "factory/inj1dxp690rd86xltejgfq2fa7f2nxtgmm5cer3hvu/bINJ"
  },
  juno: {
    token: ADDRESSES.juno.JUNO,
    hub: "juno102at0mu2xeluyw9efg257yy6pyhv088qqhmp4f8wszqcwxnpdcgqsfq0nv",
    boneToken: "juno1mvkgcr5uce2rnpzr4qrzf50hx4qreuwzlt7fzsjrhjud3xnjmttq5mkh2m",
  },
  kujira: {
    token: ADDRESSES.kujira.KUJI,
    hub: "kujira15e8q5wzlk5k38gjxlhse3vu6vqnafysncx2ltexd6y9gx50vuj2qpt7dgv",
    boneToken: "factory/kujira15e8q5wzlk5k38gjxlhse3vu6vqnafysncx2ltexd6y9gx50vuj2qpt7dgv/boneKuji"
  },
  migaloo: {
    token: ADDRESSES.migaloo.WHALE,
    hub: "migaloo1mf6ptkssddfmxvhdx0ech0k03ktp6kf9yk59renau2gvht3nq2gqdhts4u",
    boneToken: "factory/migaloo1mf6ptkssddfmxvhdx0ech0k03ktp6kf9yk59renau2gvht3nq2gqdhts4u/boneWhale"
  },
  osmosis: {
    token: ADDRESSES.osmosis.OSMO,
    hub: "osmo1s3l0lcqc7tu0vpj6wdjz9wqpxv8nk6eraevje4fuwkyjnwuy82qsx3lduv",
    boneToken: "factory/osmo1s3l0lcqc7tu0vpj6wdjz9wqpxv8nk6eraevje4fuwkyjnwuy82qsx3lduv/boneOsmo"
  },
  terra2: {
    token: ADDRESSES.terra2.LUNA,
    hub: "terra1l2nd99yze5fszmhl5svyh5fky9wm4nz4etlgnztfu4e8809gd52q04n3ea",
    boneToken: "terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml",
  }
};

module.exports = {
  timetravel: false,
    methodology: "Liquid Staking Protocol",
};

Object.keys(config).forEach(chain => {
  const { hub, token } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (!hub) return {}
      const { total_native } = await queryContractCosmos({ contract: hub, chain, data: { state: {} } });
      api.add(token, total_native)
      return api.getBalances()
    }
  }
})
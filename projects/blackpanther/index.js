const {
  queryContract: queryContractCosmos,
} = require("../helper/chain/cosmos");

const config = {
  injective: {
    farms: [
      "inj10ahageqx7guq38w3xylmrjf8vm632x76t6l5ef",
      "inj1yq8scr85pfwwdq240pa3gq2gsht5echnf223yp",
      "inj1uf2gyjzxy4l3xt7u4sg3t3x2nl4dfarugzcv74",
      "inj1yy2unvp0v49yqp8y6menjvsxd3w7720pusgt97",
      "inj12azrw3jjpnu05wd2mfpamfwse268qdgl32fnmq",
      "inj1vh4j56pf5x4sp8a3xklj0v3sq73y6cs4qvul7s",
      "inj1rcjtkmfyymcdm03alslr890khuzmzn7jxy5zgt",
      "inj1jtvgvktz7vx7yvk04ahwg54h0rd6llfknns20m",
      "inj1u22ygdfu4vq5yvcqlum7u77ac20re7hz4uxc6h",
      "inj1mrfsm3c8psn6vaznxh7ewgsp4zn5vldaq54lqu",
      "inj1l75lklg7znu96mr2lmnp87e3s2c49xkj9urjh8",
      "inj1v7eqzhdz94gydprspmdyegjwfzw94re3rpfvap",
      "inj1wf0n4jr5hz8962xszgt9s479h80zh722kp40ky",
      "inj1u8llm9l24s54e4hk7ac5wswggfr8w8nkn0ae9f",
      "inj1kepxjx47dh87ytws2fkl6j99gnhu65rzrl9m4q",
      "inj1v4hl4s7lqw84usxqhh9mhjewlwvfe5r8zygvc3",
      "inj1enh7ulash5gj0098qlcfltw5w8uyygavc8r4el",
      "inj140crz68lje9chnlyl4ewtgpcmvnnlns39t5tf0",
      "inj1z274paln0lwdl5erfcdzsmgwkt4gtv7fx39326",
      "inj1xd5w08ezq4c6eq6cjsy5zqrvtvqf7hpkp3swcw",
      "inj19hd0sx8qf3vwzd35q9a9jnx0rnwv0vzsd99k7p",
      "inj1ugrn0wulnukysaj9srd2zsw4jhw4ghg485z39g",
      "inj1spfggvc974kxfsf25eha8myjrukdgdszq34p7m",
      "inj1h3fpaw2z0hr6992hcgyr233y3377gy95h6x89y",
      "inj1yuew0d50z3ngf8mcjkc2nufdkzlck05vwdg3zu",
      "inj1jzk6f35uv86tu8t7a8qj2revdh6l6sxhy49k30",
      "inj1v5n6kswndagmt67ny5hzke6cy68eutlx5ppy8n",
      "inj1hgejdxvlupyt37vu679x697fukq5zhzu2pk3ll",
    ],
  },
};

async function farm2Tvl(chain, contract, api) {
  const res = await queryContractCosmos({ chain, contract, data: { total_vault: {} }, });

  const getToken = i => i.info?.native_token?.denom || i.info?.token?.contract_addr
  res.asset.map(i => api.add(getToken(i), +i.amount))
}

module.exports = {
  doublecounted: false,
};

Object.keys(config).forEach(chain => {
  const { farms } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      await Promise.all(farms.map(farm => farm2Tvl(chain, farm, api)))
      return api.getBalances()
    }
  }
})

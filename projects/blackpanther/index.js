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
    ],
  },
};

async function farm2Tvl(chain, contract, api) {
  const res = await queryContractCosmos({ chain, contract, data: { total_vault: {} }, });

  const getToken = i => i.info?.native_token?.denom || i.info?.token?.contract_addr
  res.asset.map(i => api.add(getToken(i), +i.amount))
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
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
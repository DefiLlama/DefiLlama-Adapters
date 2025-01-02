const { queryContract, getToken } = require('./helper/chain/cosmos')
const astroFarms = [
  'terra144mkz6p3mmnuqaenu73pg4jwayr3m28xzhaxedlfwfnyke45w6yqvf9ed6',
  'terra1ufpsjrvj5fkvdedx2ttslnrc2wxvrftf4zcsvu778cufvlh4m9dsmgcf6f',
  'terra1erm54gtdtfqv2s4c7ple3kmret7eecuj02nk5w8h08jjnenjffzsynsp0u',
  'terra1qczgczguzmxpsqfwlcaqm5hpy3jrkgrkkkcdxhd4uf28t8l8j6qsgtd863',
  'terra1ha4yvzqnq4mpu205wcd430m6m7wjklpquwn87dq89g9zersuvryses7rua',
  'terra1udwqynsmrme00ksrakkyerrfjdkw9p05557yrrw6ca6x94uuj2zs0vpqt2',
  'terra1gxqzjk4pkyzpnxnrz7h486vntvv4lmaukcs24v9gcsmcm4tyre7qytcm5e',
  'terra1w6l7kjc6wu7an37wnnehcfc3tpksw9tde9u67743ew0caly0hdasv0ws79',
  'terra1j9ggd8wf73ggsfet99wnjvn06f3l9w9lsf50uac43h6vclysfc9sp0nyfh',
  'terra1v9luz2r9u8mzd4w8ew5dm4cczk8kcxun4jry464j48jsl2fus2qss73ld4',
  'terra1n8lx9uhysjfxsc9cqanydrkqlm3wrenew8kc0vqzjr6gw0u92teqrmvxcv',
  'terra1fz4x56u96fkgzvtdxaq2969qlmfk4wnwq0fqhlrklpqc629ah9qs4h8v50',
  'terra1z8q3gq26fnvdfaj0yrf04unmlkt2uge2d0j9ve25zpyfj9u2r9jsxw8msm',
  'terra1fe83u43uz65smen45vwvj7w5838nerehv2la6utvhsr9c87ykr0qsvshqu',
  'terra1rasvh4nv8znpjg6jtkzxjskfynze98h9zv4qn8ese7tkwf0zjaaq0z60t8',
]

async function terra2(api) {
  const { chain } = api
  for (const farm of astroFarms) {
    const { total_bond_share } = await queryContract({ contract: farm, data: { state: {} }, chain })
    if (total_bond_share === 0) continue
    const { pair } = await queryContract({ contract: farm, data: { config: {} }, chain })
    const { assets, total_share } = await queryContract({ contract: pair, data: { pool: {} }, chain })
    const ratio = total_bond_share / total_share
    assets.forEach(({ amount, info }) => {
      const token = getToken(info)
      api.add(token, amount * ratio)
    })
  }

  return api.getBalances()
}

module.exports = {
    timetravel: false,
  terra: {
    tvl: () => ({}),
  },
  terra2: {
    tvl: terra2
  },
  hallmarks: [
    [1651881600, "UST depeg"],
  ]
}

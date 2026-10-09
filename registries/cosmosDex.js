const { getFactoryTvl, getSeiDexTvl } = require('../projects/terraswap/factoryTvl')
const { buildProtocolExports } = require('./utils')

// terraswap/astroport-style cosmwasm dex factories (pairs query + per-pair pool query)
//
// Chain config forms:
//   - string: factory contract address → getFactoryTvl(factory)
//   - { factory, blacklistedPairs?, extraPairs? } → getFactoryTvl(factory, { blacklistedPairs, extraPairs })
//   - { codeId } → getSeiDexTvl(codeId) (all contracts instantiated from a code id, sei)
//   - null : empty TVL chain (returns {})
function cosmosDexExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (config === null || config === undefined) {
      result[chain] = { tvl: () => ({}) }
      return
    }
    if (typeof config === 'string') {
      result[chain] = { tvl: getFactoryTvl(config) }
      return
    }
    if (config.codeId !== undefined) {
      result[chain] = { tvl: getSeiDexTvl(config.codeId) }
      return
    }
    const { factory, blacklistedPairs, extraPairs } = config
    if (!factory) throw new Error(`cosmosDex registry: missing factory for chain ${chain}`)
    result[chain] = { tvl: getFactoryTvl(factory, { blacklistedPairs, extraPairs }) }
  })
  return result
}

const configs = {
  'astroport': {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'Liquidity on the DEX',
    injective: 'inj19aenkaj6qhymmt746av8ck4r8euthq3zmxr2r6',
    terra2: 'terra14x9fr055x5hvr48hzy2t4q7kvjvfttsvxusa4xsdcy702mnzsvuqprer8r',
    neutron: {
      factory: 'neutron1hptk0k5kng7hjy35vmh009qd5m6l33609nypgf2yc6nqnewduqasxplt4e',
      blacklistedPairs: ['neutron14hn88erzgqskhvvczvdncu79tz4xqncrun5l5yqkwecmzrlpqnjquqp33f'],
    },
    osmosis: 'osmo1246fnsutktuqqzrru673pqwtt64n288004j5fauyuezwr54llw5sl6drp6',
    sei: null, // getFactoryTvl("sei1xr3rq8yvd7qplsw5yx90ftsr2zdhg4e9z60h5duusgxpv72hud3shh3qfl") DEPRECATED
  },
  'blazeswap-io': {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'Liquidity on the DEX',
    xion: 'xion16xry9c286uq7dl9qcn6xn7j4gpr5ds4aryk5tzna6xmz203kvpnqda3hya',
  },
  'dojoswap': {
    misrepresentedTokens: true,
    methodology: 'Liquidity on the DEX',
    injective: 'inj1pc2vxcmnyzawnwkf03n2ggvt997avtuwagqngk',
  },
  'dungeon-dex': {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'Liquidity in constant-product pools registered by the Dungeon DEX factory plus active legacy pools from before the current factory migration.',
    dungeon: {
      factory: 'dungeon1643rdx7yzxfhmy6ru6456t2twxhshtt9k394jh8u7qk59qfgz0esjku43x',
      // These active pools predate the current factory migration and remain available in the DEX UI.
      // Source: https://dex.dungeongames.io/mainnet/dungeon-1/pools_list.json
      extraPairs: [
        'dungeon1726r6fgz7xvmr57c0jnxpjq4u32wnd37zev5xq0t57g5g5t6s5vqvkkpld',
        'dungeon1qydhnhax5sqn7n9syjvz90z2a24ja798nwgt0fuytx5j7ptkqrtsz0dh5v',
        'dungeon1dy4udqns392grdwkjqgm6kd7k6cqzxr0rah6eetxskhfr0lq406ssfmtyr',
        'dungeon1qlzmxgu32sdww5fa6yw0hcxetj5pl6fjucug0vmksr9qkllgpwgs7qx260',
      ],
    },
  },
  'FuzioNetwork': {
    timetravel: false,
    methodology: 'Liquidity on the DEX',
    sei: { codeId: 86 },
  },
  'halotrade': {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'Liquidity on the DEX',
    aura: 'aura18qwll06qjgkfl5s5ym4rtpz8jy2tl849ghgx402tm4w9v55wu5asn0mqhv',
  },
  'phoenix-dex': {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'Liquidity on the DEX',
    terra2: 'terra1pewdsxywmwurekjwrgvjvxvv0dv2pf8xtdl9ykfce2z0q3gf0k3qr8nezy',
  },
  'seaswap': {
    timetravel: false,
    methodology: 'Liquidity on the DEX',
    sei: { codeId: 64 },
  },
  'terraswap': {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'Liquidity on the DEX',
    hallmarks: [
      ['2022-05-07', 'UST depeg'],
    ],
    terra: 'terra1ulgw0td86nvs4wtpsc80thv6xelk76ut7a7apj',
    terra2: 'terra1466nf3zuxpya8q9emxukd7vftaf6h4psr0a07srl5zw74zh84yjqxl5qul',
  },
  'tfm': {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'Liquidity on the DEX',
    terra: 'terra1u27ypputx3pu865luzs4fpjsj4llsnzf9qeq2p',
  },
  'ura': {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'Liquidity on the DEX',
    terra2: 'terra1jy84vk4gykw76hr4lydmkz55rzsfsk4v0nn4qjjzkpt00vvstrxqytlgjq',
  },
  'whitewhale-dex': {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'Liquidity on the DEX',
    hallmarks: [
      ['2022-05-07', 'UST depeg'],
      ['2023-02-13', 'Migaloo Chain Launch'],
    ],
    terra2: 'terra1f4cr4sr5eulp3f2us8unu6qv8a5rhjltqsg7ujjx6f2mrlqh923sljwhn3',
    juno: 'juno14m9rd2trjytvxvu4ldmqvru50ffxsafs8kequmfky7jh97uyqrxqs5xrnx',
    injective: null, // inj1x22q8lfhz7qcvtzs0dakhgx2th64l79kfye5lk
    comdex: null, // comdex1gurgpv8savnfw66lckwzn4zk7fp394lpe667dhu7aw48u40lj6jswv4mft
    chihuahua: 'chihuahua1s8ehad3r9wxyk08ls2nmz8mqh4vlfmaxd2nw0crxwh04t4l5je4s8ljv0j',
    migaloo: 'migaloo1z89funaazn4ka8vrmmw4q27csdykz63hep4ay8q2dmlspc6wtdgq92u369',
    sei: 'sei1tcx434euh2aszzfsjxqzvjmc4cww54rxvfvv8v7jz353rg779l2st699q0',
    osmosis: 'osmo1vuzkc4nzzav7g6t20f2vp0ed4sm3vaqnkpzy7yq3kujxs2g2hawqwnwy5w',
  },
  'xpla': {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: 'Liquidity on the DEX',
    xpla: 'xpla1j33xdql0h4kpgj2mhggy4vutw655u90z7nyj4afhxgj4v5urtadq44e3vd',
  },
}

module.exports = buildProtocolExports(configs, cosmosDexExportFn)

// vaults are closed: https://articles.apollo.farm/apollo-dao-will-be-closing-vaults-on-terra-classic/
const { tvlFromLockedGammTokens } = require('../helper/chain/cosmos')
const { transformBalances } = require('../helper/portedTokens')

const chain = 'osmosis'

const contractAddresses = {
    ATOM_STATOM: "osmo1a6tcf60pyz8qq2n532dzcs7s7sj8klcmra04tvaqympzcvxqg9esn7xz7l",
    ATOM_OSMO: "osmo1g3kmqpp8608szfp0pdag3r6z85npph7wmccat8lgl3mp407kv73qlj7qwp",
    USDC_OSMO: "osmo1jfmwayj8jqp9tfy4v4eks5c2jpnqdumn8x8xvfllng0wfes770qqp7jl4j",
    STOSMO_OSMO: "osmo1p4zqs5y2w5srzd2vesznzu5ql8wfq9tpz3e7mf2j3y07nxrtkdes5r5g0t",
    WBTC_OSMO: "osmo185gqewrlde8vrqw7j8lpad67v8jfrx9u7770k9q87tqqecctp5tq50wt2c",
    STRD_OSMO: "osmo1e3qjfcg9adrauz6jg030ptfy35r6zzplsgaavnn6xrh6686udhfqq7muwy",
    EVMOS_OSMO: "osmo1rkv6vcmty4rpypuxp2a6a0y5ze4ztm3y6d6xwy5a7cye85f7reqsm85c5s",
    JUNO_OSMO: "osmo1ceku0zks6y43r9l35n7wnv5pf82s6l4k5jhlrhkurakeemey9n4snz3x6z",
    WETH_OSMO: "osmo1r235f4tdkwrsnj3mdm9hf647l754y6g6xsmz0nas5r4vr5tda3qsgtftef",
    IST_OSMO: "osmo1qajgwrcce9srkq370pa9ew96dyk4hajyyk6rfpuexrktm8862xnst443kp",
    ION_OSMO: "osmo1869zena97sctemj78sgjmu737p2g94905hsf3hhkrfgummrfz4tsxj2k6r",
    CRO_OSMO: "osmo1gmd2vc4crmv7urlfn3j5avhplfncjf5mg649dkgsu5a0zvd6cgrsn9dq4l",
    AXL_OSMO: "osmo1m9e4cks405tvzlppkw64znr35vkvujvptrdqtgu5q6luk4ccw9qqeuenwd",
    DAI_OSMO: "osmo1lhs6kyuxytu4suua0qf88z5057wzpxs77tyrlgztw2uctcy75hcqf2ajrt",
    AKT_OSMO: "osmo122ryl7pez7yjprtvjckltu2uvjxrq3kqt4nvclax2la7maj6757qg054ga",
};

async function tvl() {
    let tvl = await tvlFromLockedGammTokens(contractAddresses, chain)
    return transformBalances(chain, tvl)
}

module.exports = {
    timetravel: false,
    methodology: "Total TVL on vaults",
    terra: {
        tvl: () => 0
    },
    osmosis: {
        tvl,
    },
}
    // module.exports.hallmarks = [
    //     [1651881600, "UST depeg"],
    //     [Math.floor(new Date('2022-09-13') / 1e3), 'Stop supporting Terra Classic'],
    // ]

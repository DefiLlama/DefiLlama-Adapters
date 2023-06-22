// vaults are closed: https://articles.apollo.farm/apollo-dao-will-be-closing-vaults-on-terra-classic/
const { endPoints } = require('../helper/chain/cosmos')
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

async function tvlFromLockedGammTokens(contractAddresses, chain) {
    let amounts = {}
    if (chain != "osmosis") return amounts;
    for (const contractName in contractAddresses) {
        contractAddress = contractAddresses[contractName];
        let gammBalanceEndpoint = `${getEndpoint(chain)}/bank/balances/${contractAddress}`;
        const balances = (await axios.get(gammBalanceEndpoint)).data.result;
        const gammTokens = balances.filter(item => item.denom.startsWith('gamm/pool'));
        for (const gammToken of gammTokens) {
            const gammAmount = gammToken.amount;
            const poolID = gammToken.denom.split('gamm/pool/')[1];

            let poolEndpoint = `${getEndpoint(chain)}/osmosis/gamm/v1beta1/pools/${poolID}`;
            const poolData = (await axios.get(poolEndpoint)).data.pool;

            let amount = calculateTokenAmounts(poolData, gammAmount)
            for (const denom in amount) {
                if (typeof amounts[denom] === "undefined") {
                    amounts[denom] = amount[denom];
                } else {
                    amounts[denom] += amount[denom];
                }
            }
        }
    }
    return amounts;
}

function calculateTokenAmounts(poolData, gammAmount) {
    // Extract the total pool shares.
    let totalShares = poolData.total_shares.amount;

    // Initialize an object to hold the amounts of each token.
    let tokenAmounts = {};

    // For each token in the pool...
    for (let asset of poolData.pool_assets) {
        // Extract the token's denom and amount.
        let denom = asset.token.denom;
        let assetAmount = asset.token.amount;

        // Calculate the amount of this token that corresponds to the given amount of pool shares.
        tokenAmounts[denom] = (gammAmount * assetAmount) / totalShares;
    }

    return tokenAmounts;
}

function getEndpoint(chain) {
    if (!endPoints[chain]) throw new Error("Chain not found: " + chain);
    return endPoints[chain];
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
    hallmarks: [
        [1651881600, "UST depeg"],
        [Math.floor(new Date('2022-09-13') / 1e3), 'Stop supporting Terra Classic'],
    ],
}

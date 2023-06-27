const axios = require("axios");
const { endPoints, queryContract } = require('../helper/chain/cosmos')
const sdk = require('@defillama/sdk')

const chain = 'quasar'

const lpStrategyContracts = {
    1: [
        "quasar14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sy9numu",
        "quasar1l468h9metf7m8duvay5t4fk2gp0xl94h94f3e02mfz4353de2ykqh6rcts",
        "quasar1cp8cy5kvaury53frlsaml7ru0es2reln66nfj4v7j3kcfxl4datqsw0aw4",
        "quasar1kj8q8g2pmhnagmfepp9jh9g2mda7gzd0m5zdq0s08ulvac8ck4dq9ykfps",
    ],
    678: [
        "quasar1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrsmslfn4",
        "quasar1ma0g752dl0yujasnfs9yrk6uew7d0a2zrgvg62cfnlfftu2y0egqx8e7fv",
    ],
    704: [
        "quasar1yyca08xqdgvjz0psg56z67ejh9xms6l436u8y58m82npdqqhmmtqk5tv30",
    ],
    803: [
        "quasar1jgn70d6pf7fqtjke0q63luc6tf7kcavdty67gvfpqhwwsx52xmjq7kd34f",
        "quasar1t9adyk9g2q0efn3xndunzy4wvdrnegjkpvp382vm2uc7hnvash5qpzmxe4",
    ],
    833: [
        "quasar1ery8l6jquynn9a4cz2pff6khg8c68f7urt33l5n9dng2cwzz4c4qxhm6a2",
    ],
    904: [
        "quasar1ch4s3kkpsgvykx5vtz2hsca4gz70yks5v55nqcfaj7mgsxjsqypsxqtx2a",
    ],
    944: [
        "quasar1xkakethwh43dds3ccmsjals9jt7qsfmedgm9dvm9tpqq8watpv9q0458u6",
        "quasar1ch4s3kkpsgvykx5vtz2hsca4gz70yks5v55nqcfaj7mgsxjsqypsxqtx2a",
    ],
}


async function tvl() {
    const api = new sdk.ChainApi({ chain: 'osmosis' })

    for (const poolID in lpStrategyContracts) {
        let lpContracts = lpStrategyContracts[poolID];
        let poolEndpoint = `${endPoints['osmosis']}/osmosis/gamm/v1beta1/pools/${poolID}`;
        const poolData = (await axios.get(poolEndpoint)).data.pool;

        for (const contractAddress of lpContracts) {
            let lp_shares = await queryContract({
                contract: contractAddress,
                chain: chain,
                data: { 'lp_shares': {} }
            });

            let amount = calculateTokenAmounts(poolData, lp_shares['lp_shares']['locked_shares'])
            for (const denom in amount) {
                api.add(denom, amount[denom])
            }
        }
    }

    return api.getBalances()
}


function calculateTokenAmounts(poolData, gammAmount) {
    // Extract the total pool shares.
    let totalShares = poolData.total_shares.amount;

    // Initialize an object to hold the amounts of each token.
    let tokenAmounts = {};

    // For each token in the pool...
    if (typeof poolData.pool_assets !== "undefined") {
        for (let asset of poolData.pool_assets) {
            // Extract the token's denom and amount.
            let denom = asset.token.denom;
            let assetAmount = asset.token.amount;

            // Calculate the amount of this token that corresponds to the given amount of pool shares.
            tokenAmounts[denom] = (gammAmount * assetAmount) / totalShares;
        }
    } else {
        for (let asset of poolData.pool_liquidity) {
            // Extract the token's denom and amount.
            let denom = asset.denom;
            let assetAmount = asset.amount;

            // Calculate the amount of this token that corresponds to the given amount of pool shares.
            tokenAmounts[denom] = (gammAmount * assetAmount) / totalShares;
        }
    }

    return tokenAmounts;
}

module.exports = {
    timetravel: false,
    methodology: "Total TVL on vaults",
    quasar: {
        tvl,
    },
}
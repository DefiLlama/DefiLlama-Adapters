const axios = require("axios");
const { endPoints, queryContract } = require('../helper/chain/cosmos')
const { transformBalances } = require('../helper/portedTokens')

const chain = 'quarsar'

const vaultContracts = {
    atom: "quasar1z89funaazn4ka8vrmmw4q27csdykz63hep4ay8q2dmlspc6wtdgq4grcxm",
    osmo: "quasar1aakfpghcanxtc45gpqlx8j3rq0zcpyf49qmhm9mdjrfx036h4z5sjtnaa3",
}

const lpStrategyContracts = [
    "quasar14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sy9numu",
    "quasar1yyca08xqdgvjz0psg56z67ejh9xms6l436u8y58m82npdqqhmmtqk5tv30",
    "quasar1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrsmslfn4",
    "quasar1l468h9metf7m8duvay5t4fk2gp0xl94h94f3e02mfz4353de2ykqh6rcts",
    "quasar1jgn70d6pf7fqtjke0q63luc6tf7kcavdty67gvfpqhwwsx52xmjq7kd34f",
    "quasar1xkakethwh43dds3ccmsjals9jt7qsfmedgm9dvm9tpqq8watpv9q0458u6",
    "quasar1cp8cy5kvaury53frlsaml7ru0es2reln66nfj4v7j3kcfxl4datqsw0aw4",
    "quasar1t9adyk9g2q0efn3xndunzy4wvdrnegjkpvp382vm2uc7hnvash5qpzmxe4",
    "quasar1ch4s3kkpsgvykx5vtz2hsca4gz70yks5v55nqcfaj7mgsxjsqypsxqtx2a",
]


async function tvl() {
    let amounts = {}
    for (const contractName in vaultContracts) {
        let contractAddress = vaultContracts[contractName];
        let tvlInfo = await queryContract({
            contract: contractAddress,
            chain: chain,
            data: { 'get_tvl_info': {} }
        });

        for (const primitive of tvlInfo['primitives']){
            let lockedShares = primitive['lp_shares']['locked_shares']
            let poolID = primitive['lp_denom'].split('gamm/pool/')[1];
            let poolEndpoint = `${endPoints['osmosis']}/osmosis/gamm/v1beta1/pools/${poolID}`;
            const poolData = (await axios.get(poolEndpoint)).data.pool;
            
            let amount = calculateTokenAmounts(poolData, lockedShares)
            for (const denom in amount) {
                if (typeof amounts[denom] === "undefined") {
                    amounts[denom] = amount[denom];
                } else {
                    amounts[denom] += amount[denom];
                }
            }
        }     
    }

    return transformBalances(chain, amounts)
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
    quarsar: {
        tvl,
    },
}
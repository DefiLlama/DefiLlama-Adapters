const { queryContract } = require('../helper/chain/cosmos')
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
        for (const contractAddress of lpContracts) {
            try {
                let ica_balances = await queryContract({
                    contract: contractAddress,
                    chain: chain,
                    data: { 'ica_balance': {} }
                });

                let denom = ica_balances.amount.denom;
                let amount = Number(ica_balances.amount.amount);

                api.add(denom, amount)
            } catch (e) {
                console.log(e)
                continue;
            }
        }
    }

    return api.getBalances()
}

module.exports = {
    timetravel: false,
    methodology: "Total TVL on vaults",
    osmosis: {
        tvl,
    },
}
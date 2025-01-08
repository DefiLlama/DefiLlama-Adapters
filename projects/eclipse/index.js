const { queryContract } = require('../helper/chain/cosmos')

const tokens = {
    "ASTRO": "factory/neutron1ffus553eet978k024lmssw0czsxwr97mggyv85lpcsdkft8v9ufsz3sa07/astro",
    "ECLIP": "factory/neutron10sr06r3qkhn7xzpw3339wuj77hu06mzna6uht0/eclip"
}

async function singleSideStaking(api){
    const astroStakingBalance = await queryContract({
        contract: "neutron1qk5nn9360pyu2tta7r4hvmuxwhxj5res79knt0sntmjcnwsycqyqy2ft9n",
        chain: 'neutron',
        data: {
            total_staking: {}
        }
    });

    api.add(tokens["ASTRO"], (astroStakingBalance))
}

async function lpStaking(api){
    const astroStakingBalance = await queryContract({
        contract: "neutron1d5p2lwh92040wfkrccdv5pamxtq7rsdzprfefd9v9vrh2c4lgheqvv6uyu",
        chain: 'neutron',
        data: {
            total_staking: {}
        }
    });

    const totalDeposit = await queryContract({
        contract: "neutron1zlf3hutsa4qnmue53lz2tfxrutp8y2e3rj4nkghg3rupgl4mqy8s5jgxsn",
        chain: 'neutron',
        data: {
            total_deposit: {}
        }
    });

    const totalShares = await queryContract({
        contract: "neutron1zlf3hutsa4qnmue53lz2tfxrutp8y2e3rj4nkghg3rupgl4mqy8s5jgxsn",
        chain: 'neutron',
        data: {
            total_shares: {}
        }
    });

    const conversionRate = Number(totalDeposit) / Number(totalShares);

    api.add(tokens["ASTRO"], (2 * conversionRate * astroStakingBalance))
}

async function eclipStaking(api){
    const eclipStakingBalance = await queryContract({
        contract: "neutron19q93n64nyet24ynvw04qjqmejffkmyxakdvl08sf3n3yeyr92lrs2makhx",
        chain: 'neutron',
        data: {
            query_state: {}
        }
    });

    api.add(tokens["ECLIP"], ((Number(eclipStakingBalance.stake_state.total_bond_amount) )));
}

module.exports = {
    neutron: {
        tvl: singleSideStaking,
        pool2: lpStaking,
        staking: eclipStaking,
    },
}
const sdk = require('@defillama/sdk')

const stakingContract = '0x5B0d74C78F2588B3C5C49857EdB856cC731dc557'
const colonyGovernanceToken = '0xec3492a2508DDf4FDc0cD76F31f340b30d1793e6'

async function tvl (timestamp, block) {
    const valueLocked = (await sdk.api.erc20.balanceOf({
        block,
        target: colonyGovernanceToken,
        owner: stakingContract,
        chain: 'avax'
    })).output
    return { [colonyGovernanceToken]: valueLocked }
}

module.exports = {
    methodology: 'TVL is calculated based on CLY tokens locked on Colony staking contract',
    avalanche: {
        tvl
    },
    tvl
}

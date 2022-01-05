const sdk = require('@defillama/sdk');
const abi = require('./ABI.json');

const STAKING_RAIL = '0xee6a649aa3766bd117e12c161726b693a1b2ee20';
const RAIL = '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D';
async function tvl(timestamp, block) {
    let balances = {};

    try {
        const interval = await sdk.api.abi.call({
            target: STAKING_RAIL,
            abi: abi['intervalAtTime'],
            params: timestamp,
            block: block
        });

        const railTVL = await sdk.api.abi.call({
            target: STAKING_RAIL,
            abi: abi['globalsSnapshotAt'],
            params: [interval.output, 0],
            block: block
        });

        balances[RAIL] = railTVL.output.totalStaked;
    } catch (e) {
        balances[RAIL] = 0;
    }


    return balances;
}

module.exports = {
    website: 'https://railgun.ch',
    ethereum: {
        tvl,
    }
}


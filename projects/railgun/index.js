const sdk = require('@defillama/sdk');
const abi = require('./ABI.json');

const STAKING_RAIL = '0xee6a649aa3766bd117e12c161726b693a1b2ee20';
const RAIL = '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D';
const TREASURY = '0xc851fbe0f07a326ce0326ccc70c2a62732e74d6c';
const PROXY = '0xbf0Af567D60318f66460Ec78b464589E3f9dA48e';

function getTVLFunc(contractAddress) {
    return async function(timestamp, block) {
        const balances = {};
        const tokens = await sdk.api.util.tokenList();
        const result = await sdk.api.abi.multiCall({
            calls: tokens.map(t => ({target: t.contract, params: contractAddress})),
            abi: 'erc20:balanceOf',
            block: block
        });

        for(const r of result.output) {
            if(r.success && r.output && r.output !== '0') {
                balances[r.input.target] = r.output;
            }
        }

        return balances;
   }
}

async function staking(timestamp, block) {
    const balances = {};

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
        staking,
        treasury: getTVLFunc(TREASURY),
        tvl: getTVLFunc(PROXY),
    }
}


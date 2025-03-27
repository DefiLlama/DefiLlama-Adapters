const sdk = require('@defillama/sdk')
const { getConfig } = require('../helper/cache')

async function tvl(api) {
    const pairs = await getConfig('resupply/tvl/', 'https://raw.githubusercontent.com/resupplyfi/resupply/main/deployment/contracts.json');
    
    const pairsContracts = [];

    for (const [key, value] of Object.entries(pairs)) {
        if (!key.endsWith('_DEPRECATED')) {
            if (key.startsWith('PAIR_CURVELEND') || key.startsWith('PAIR_FRAXLEND')) {
                pairsContracts.push(value); // Added to collect contract addresses
            }
        }
    }

    const [balances] = await Promise.all([  
        api.multiCall({
            abi: 'uint256:totalCollateral',
            calls: pairsContracts,
        })
    ]);

    const tokens = await api.multiCall({  // Fixed syntax and stored result
        abi: 'address:underlying',
        calls: pairsContracts,
    });

    api.add(tokens, balances); 
    }

module.exports = {
    start: '2025-03-15',
    ethereum: {
        tvl,
    }
};
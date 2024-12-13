const { sumTokens2 } = require('../helper/unwrapLPs')

const BBBPUMP_CONTRACT = "0x2E24BFdE1EEDa0F1EA3E57Ba7Ff10ac6516ab5Ec";

async function tvl(timestamp, block, chainBlocks, { chain = 'xdc' } = {}) {
    try {
        const balances = {};
        return await sumTokens2({ 
            balances,
            owner: BBBPUMP_CONTRACT,
            chain,
            block: chainBlocks[chain],
        });
    } catch (error) {
        console.error(`Error in BBBPUMP tvl: ${error.message}`);
        throw error;
    }
}

module.exports = {
    xdc: {
        tvl
    }
};

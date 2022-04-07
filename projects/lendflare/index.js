const convexBooster = require('./convexBooster.js');
const supplyBooster = require('./supplyBooster.js');
const { toUSDTBalances } = require('./utils.js');

async function tvl(timestamp, block, chainBlocks) {
    const borrow = await convexBooster.tvl(timestamp, block, chainBlocks);
    const supply = await supplyBooster.tvl(timestamp, block, chainBlocks);

    console.log(`borrow ${borrow.toString()}`);
    console.log(`supply ${supply.toString()}`);

    return toUSDTBalances(borrow.plus(supply));
}

module.exports = {
    timetravel: true,
    ethereum: {
        tvl,
    }
};

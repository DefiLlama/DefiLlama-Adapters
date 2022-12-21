const helpers = require('./helper');


async function tvl(timestamp, ethBlock, chainBlocks) {
    const balances = await helpers.tvl(timestamp, ethBlock, chainBlocks);
    console.log(balances);
    return balances;
}

// async function main() {
//     // remove in actual code
//     const { ethers } = require('ethers');
//     const provider = new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
//     const block = await provider.getBlock();
//     const timestamp = block.timestamp;
//     const ethBlock = block.number;
//     const chainBlocks = {
//         'arbitrum': ethBlock,
//     };
//     tvl(timestamp, ethBlock, chainBlocks);
// }
// main();
module.exports = {
    misrepresentedTokens: false,
      arbitrum: {
        tvl,
      },
      methodology: 'Hello'
};
const sdk = require("@defillama/sdk");
const { transformFantomAddress } = require('./helper/portedTokens');
const { unwrapUniswapLPs } = require('./helper/unwrapLPs');
const locked = {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"locked","outputs":[{"internalType":"int128","name":"amount","type":"int128"},{"internalType":"uint256","name":"end","type":"uint256"}],"stateMutability":"view","type":"function"};
const totalBalances = {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"totalBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"};
const allPairsLength = {"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"};
const allPairs = {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"};
const SOLID = '0x888EF71766ca594DED1F0FA3AE64eD2941740A20';

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    const transform = await transformFantomAddress();
    balances[`fantom:${SOLID}`]= (await sdk.api.abi.call({
        target: '0xcbd8fea77c2452255f59743f55a3ea9d83b3c72b',
        abi: locked,
        params: [ 8 ],
        block: chainBlocks.fantom,
        chain: 'fantom'
    })).output.amount;

    const noPairs = (await sdk.api.abi.call({
        target: '0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28',
        abi: allPairsLength,
        block: chainBlocks.fantom,
        chain: 'fantom'
    })).output;

    const pairAddresses = (await sdk.api.abi.multiCall({
        target: '0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28',
        calls: Array.from({ length: Number(noPairs) }, (_, k) => ({
            params: k,
          })),
        abi: allPairs,
        block: chainBlocks.fantom,
        chain: 'fantom'
    })).output;
    // node test.js projects/solidex.js
    let pairBalances = (await sdk.api.abi.multiCall({
        target: '0x26E1A0d851CF28E697870e1b7F053B605C8b060F',
        calls: pairAddresses.map(a => ({
            params: a.output
        })),
        abi: totalBalances,
        block: chainBlocks.fantom,
        chain: 'fantom'
    })).output;

    let lpPositions = [];
    for (let i = 0; i < pairBalances.length; i++) {
        lpPositions.push({
            balance: pairBalances[i].output,
            token: pairAddresses[i].output
        });
    };

    await unwrapUniswapLPs(
        balances, 
        lpPositions, 
        chainBlocks.fantom, 
        'fantom', 
        transform 
        [
            '0x888ef71766ca594ded1f0fa3ae64ed2941740a20',
            '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
            '0x41adac6c1ff52c5e27568f27998d747f7b69795b',
            '0xb0cc73023ba20b17d8117b117a05fc86a3a62aa1',
            '0xe0eb2dc74e7431cc519085dfd1993ced4803f80e',
            '0x7ab86db5431cfd7b98b2c12024c90e6fddb4c252',
            '0xd31fcd1f7ba190dbc75354046f6024a9b86014d7'
        ]
    );

    return balances;
};

module.exports = {
    tvl
};
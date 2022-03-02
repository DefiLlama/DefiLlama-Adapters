const sdk = require("@defillama/sdk");
const { transformFantomAddress } = require('../helper/portedTokens');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');
const abis = require("./abis.json");

const SOLID = '0x888EF71766ca594DED1F0FA3AE64eD2941740A20';
const excludedTokens = [
    '0x10acb810b4d9a8d7c9a50fd793af80931c73832d',
    '0x7bff7b5a436de7d0e8b860d495a8239a233d2f22',
    '0xc61553f86e8dbdb732a3d0e9118bbce1ed84900a',
    '0x7c4296d0c49db126d0781504d8ed28ee5bf9b83a',
    '0x184fef2286fdfeb6c581f45ce96628ce4bb274dd',
];

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    const transform = await transformFantomAddress();
    balances[`fantom:${SOLID}`] = (await sdk.api.abi.call({
        target: '0xcbd8fea77c2452255f59743f55a3ea9d83b3c72b',
        abi: abis.locked,
        params: [8],
        block: chainBlocks.fantom,
        chain: 'fantom'
    })).output.amount;

    const noPairs = (await sdk.api.abi.call({
        target: '0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28',
        abi: abis.allPairsLength,
        block: chainBlocks.fantom,
        chain: 'fantom'
    })).output;

    const pairAddresses = (await sdk.api.abi.multiCall({
        target: '0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28',
        calls: Array.from({ length: Number(noPairs) }, (_, k) => ({
            params: k,
        })),
        abi: abis.allPairs,
        block: chainBlocks.fantom,
        chain: 'fantom'
    })).output;

    let pairBalances = (await sdk.api.abi.multiCall({
        target: '0x26E1A0d851CF28E697870e1b7F053B605C8b060F',
        calls: pairAddresses.map(a => ({
            params: a.output
        })),
        abi: abis.totalBalances,
        block: chainBlocks.fantom,
        chain: 'fantom'
    })).output;

    let lpPositions = [];
    for (let i = 0; i < pairBalances.length; i++) {
        if (
            pairAddresses[i].output &&
            excludedTokens.includes(pairAddresses[i].output.toLowerCase())
        ) {
            continue;
        };
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
    );

    return balances;
};

module.exports = {
    tvl
};
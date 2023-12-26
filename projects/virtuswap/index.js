const {sumTokens2} = require('../helper/unwrapLPs');

const FACTORY_CONTRACT = '0xd4E3668A9C39ebB603f02A6987fC915dBC906B43';
const STAKER = '0x9C58a2B79cd054442D5970b925637B9E88E7ecc2';
const VRSW_TOKEN_POLYGON = '0x57999936fC9A9EC0751a8D146CcE11901Be8beD0';

async function getAllPairs(factory, api) {
    const pairsNumber = await api.call({
        abi: 'function allPairsLength() view returns (uint256)',
        target: factory
    });
    const pools = await api.multiCall({
        calls: Array.from({length: pairsNumber}, (_, i) => i).map(i => ({
            target: factory,
            params: [i]
        })),
        abi: 'function allPairs(uint256) view returns (address)',
    });
    return pools;
}

async function getAllowedTokens(pool, api) {
    const tokensNumber = await api.call({
        abi: 'function allowListLength() view returns (uint256)',
        target: pool
    });
    let tokens = await api.multiCall({
        calls: Array.from({length: tokensNumber}, (_, i) => i).map(i => ({
            target: pool,
            params: [i],
        })),
        abi: 'function allowList(uint256) view returns (address)',
    });
    const nativeTokens = await api.call({
        abi: 'function getTokens() view returns (address, address)',
        target: pool,
    });
    if (!tokens.includes(nativeTokens[0])) {
        tokens.push(nativeTokens[0]);
    }
    if (!tokens.includes(nativeTokens[1])) {
        tokens.push(nativeTokens[1]);
    }
    return tokens;
}

async function tvl(_, _1, _2, { api }) {
    const stakerVrswBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: VRSW_TOKEN_POLYGON,
        params: [STAKER],
    });
    await api.add(VRSW_TOKEN_POLYGON, stakerVrswBalance);

    const pools = await getAllPairs(FACTORY_CONTRACT, api);
    const ownerTokens = await Promise.all(pools.map(
        async pool => [await getAllowedTokens(pool, api), pool])
    );

    return sumTokens2({ownerTokens, api});
}

module.exports = {
    methodology: 'TVL: sum of all pools liquidity plus staked VRSW tokens',
    polygon: {
        tvl
    },
};


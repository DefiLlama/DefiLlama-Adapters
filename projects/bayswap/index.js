const { dexExport } = require('../helper/chain/sui');

const enrichPrefixZero = (type_) => {
    const parts = type_.split('::');
    if (parts.length !== 3) {
        return parts.join('::');
    }
    if (parts[0].length === 65) {
        parts[0] = '0x0' + parts[0].slice(2);
    }

    return parts.join('::');
};

const parsingPoolTypes = (types_) => {
    const t = types_.substring(types_.lastIndexOf('<') + 1, types_.lastIndexOf('>'));
    const slice = t.replaceAll(' ', '').split(',');
    if (slice.length < 3) {
        throw new Error('invalid pool type');
    }

    return {
        coinXType: enrichPrefixZero(slice[0]),
        coinYType: enrichPrefixZero(slice[1]),
        curveType: enrichPrefixZero(slice[2]),
    };
};

const getTokens = (pool) => {
    const {coinXType, coinYType} = parsingPoolTypes(pool.type)
    return [coinXType, coinYType]
};

module.exports = dexExport({
    account: '0x72b55bab9064f458451ccf0157e2e0317bcd9b210476b9954081c44ee07b7702',
    poolStr: 'liquidity_pool::LiquidityPool',
    token0Reserve: i => i.fields.coin_x_reserve,
    token1Reserve: i => i.fields.coin_y_reserve,
    getTokens
});

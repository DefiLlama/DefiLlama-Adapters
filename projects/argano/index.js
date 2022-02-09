const sdk = require('@defillama/sdk')
const { calculateUniTvl } = require('../helper/calculateUniTvl')
const { transformPolygonAddress } = require('../helper/portedTokens')

const contracts = {
    factory: '0xdAc31E70c2C4Fea0629e85e7B67222127A8672d8',
    usdtPool: '0x250EFcd45D9f83036f2D403223c7cCb2E1e9D00b',
    usdt: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    wbtcPool: '0x610094adF401626D6B62df62bF6E67A7A6E22043',
    wbtc: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6'
};

async function tvl(timestamp, block, chainBlocks) {
    const transform = await transformPolygonAddress();
    let balances = await calculateUniTvl(
        transform, 
        chainBlocks.polygon, 
        'polygon', 
        contracts.factory, 
        23309648
    );

    const deposits = await sdk.api.abi.multiCall({
        calls: [{
            target: contracts.usdt,
            params: contracts.usdtPool
        }, {
            target: contracts.wbtc,
            params: contracts.wbtcPool
        }],
        abi: "erc20:balanceOf",
        chain: 'polygon',
        block: chainBlocks.polygon
    });

    await sdk.util.sumMultiBalanceOf(
        balances, 
        deposits,
        true,
        transform
    );

    return balances;
};

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    polygon: {
        tvl
    }
};
const sdk = require('@defillama/sdk');

let usdc = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
let ovn = '0xcE5bcF8816863A207BF1c0723B91aa8D5B9c6614';

async function tvl(time, ethBlock) {

    const totalSupply = (await sdk.api.erc20.totalSupply({
        chain: 'polygon',
        target: ovn,
        ethBlock
    })).output

    return {
        ['polygon:' + usdc]: totalSupply
    };

}


module.exports = {
    methodology: 'Get the number of OVN tokens. According to the protocol 1 OVN = 1 USDC',
    polygon: {
        tvl: tvl
    },

}

const tokens = {
    BalancerContract: '0xba12222222228d8ba445958a75a0704d566bf2c8'
};
const coins = {};
const pools = [
    {
        id: 'CLEV/ETH',
        name: 'CLEV/ETH',
        coins: [
            coins.weth,
            coins.clev,
        ],
        fromPlatform: "Curve",
        addresses: {
            poolAddress: '0x342D1C4Aa76EA6F5E5871b7f11A019a0eB713A4f',
            token: '0x6C280dB098dB673d30d5B34eC04B6387185D3620',
            gauge: '0x86e917ad6Cb44F9E6C8D9fA012acF0d0CfcF114f',
        },
    },
    {
        id: 'clevCVX/CVX',
        name: 'clevCVX/CVX',
        coins: [
            coins.cvx,
            coins.clevCVX
        ],
        fromPlatform: "Curve",
        addresses: {
            poolAddress: '0xF9078Fb962A7D13F55d40d49C8AA6472aBD1A5a6',
            token: '0xF9078Fb962A7D13F55d40d49C8AA6472aBD1A5a6',
            gauge: '0xF758BE28E93672d1a8482BE15EAf21aa5450F979',
        },
    },
    {
        id: 'clevCVX/CVX',
        name: 'clevCVX/CVX',
        coins: [
            coins.cvx,
            coins.clevCVX,
        ],
        fromPlatform: "Balancer",
        addresses: {
            poolAddress: '0x69671c808c8f1c1490a4c9e0145884dfb5631378000200000000000000000392',
            token: '0x69671c808c8f1c1490a4c9e0145884dfb5631378',
            gauge: '0x9b02548De409D7aAeE228BfA3ff2bCa70e7a2fe8',
        },
    },
]
module.exports = { pools, tokens };
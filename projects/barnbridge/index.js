/*==================================================
  Imports
==================================================*/
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

/*==================================================
  Settings
==================================================*/
const listedTokens = [
    // Compound - USDC
    {
        isCompound: true,
        provider: '0xDAA037F99d168b552c0c61B7Fb64cF7819D78310',
        cToken: {
            address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
            decimals: 8,
        },
        uToken: {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            decimals: 6,
        },
    },
    // Compound - DAI
    {
        isCompound: true,
        provider: '0xe6c1a8e7a879d7febb8144276a62f9a6b381bd37',
        cToken: {
            address: '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',
            decimals: 8,
        },
        uToken: {
            address: '0x6b175474e89094c44da98b954eedeac495271d0f',
            decimals: 18,
        },
    },
    // AAVE - USDC
    {
        isAave: true,
        provider: '0x99230f93135f3650ab5706b7b6d4b30b4ee961c9',
        cToken: {
            address: '0xbcca60bb61934080951369a648fb03df4f96263c',
            decimals: 6,
        },
        uToken: {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            decimals: 6,
        },
    },
    // AAVE - DAI
    {
        isAave: true,
        provider: '0x372d02e58a8fcf42114232f614d57f31401d4c7d',
        cToken: {
            address: '0x028171bca77440897b824ca71d1c56cac55b68a3',
            decimals: 18,
        },
        uToken: {
            address: '0x6b175474e89094c44da98b954eedeac495271d0f',
            decimals: 18,
        },
    },
    // AAVE - USDT
    {
        isAave: true,
        provider: '0xbf5649526aa1dc1daa82ed29ddc65149278ca5d8',
        cToken: {
            address: '0x3ed3b47dd13ec9a98b44e6204a523e766b225811',
            decimals: 6,
        },
        uToken: {
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            decimals: 6,
        },
    },
    // AAVE - GUSD
    {
        isAave: true,
        provider: '0x5cfcfb6171db72a26b84bc50edd2d80b0f3fc094',
        cToken: {
            address: '0xd37ee7e4f452c6638c96536e68090de8cbcdb583',
            decimals: 2,
        },
        uToken: {
            address: '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd',
            decimals: 2,
        },
    },
    // Cream - USDC
    {
        isCream: true,
        provider: '0xa4f8310cd972b1fc3ca9f130b235a91bc882badb',
        cToken: {
            address: '0x44fbebd2f576670a6c33f6fc0b00aa8c5753b322',
            decimals: 8,
        },
        uToken: {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            decimals: 6,
        },
    },
    // Cream - DAI
    {
        isCream: true,
        provider: '0x37923eb0f4a9097b2774eab9d928afad6196cf76',
        cToken: {
            address: '0x92b767185fb3b04f881e3ac8e5b0662a027a1d9f',
            decimals: 8,
        },
        uToken: {
            address: '0x6b175474e89094c44da98b954eedeac495271d0f',
            decimals: 18,
        },
    },
    // Cream - USDT
    {
        isCream: true,
        provider: '0x7b1e1a841afe589f1b5337a2eec41a18a58475be',
        cToken: {
            address: '0x797aab1ce7c01eb727ab980762ba88e7133d2157',
            decimals: 8,
        },
        uToken: {
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            decimals: 6,
        },
    },
];

/*==================================================
  Helpers
==================================================*/
function createAbiViewItemFor(name, inputs, outputs) {
    return {
        name,
        type: 'function',
        stateMutability: 'view',
        inputs: inputs.map(input => ({
            name: '',
            type: input,
        })),
        outputs: outputs.map(output => ({
            name: '',
            type: output,
        })),
    };
}

function getCBalanceFor(cTokenAddress, cTokenDecimals, providerAddress, block) {
    const abi = createAbiViewItemFor('balanceOf', ['address'], ['uint256']);

    return sdk.api.abi.call({
        abi,
        target: cTokenAddress,
        params: [providerAddress],
        block,
    }).then(({output}) => new BigNumber(output).dividedBy(10 ** cTokenDecimals));
}

function getCExchangeRateFor(cTokenAddress, cTokenDecimals, uTokenDecimals, block) {
    const abi = createAbiViewItemFor('exchangeRateStored', [], ['uint256']);
    const decimals = 18 + uTokenDecimals - cTokenDecimals;

    return sdk.api.abi.call({
        abi,
        target: cTokenAddress,
        block,
    }).then(({output}) => new BigNumber(output).dividedBy(10 ** decimals));
}

/*==================================================
  Main
==================================================*/
async function tvl(timestamp, block) {
    const balances = {};

    await Promise.all(listedTokens.map(async token => {
        const {provider, uToken, cToken} = token;
        const uTokenAddr = uToken.address;
        const uTokenDecimals = uToken.decimals;
        const cTokenAddr = cToken.address;
        const cTokenDecimals = cToken.decimals;

        if (!balances[uTokenAddr]) {
            balances[uTokenAddr] = new BigNumber(0);
        }

        let balance;
        let exchangeRate;

            if (token.isCompound || token.isCream) {
                balance = await getCBalanceFor(cTokenAddr, cTokenDecimals, provider, block);
                exchangeRate = await getCExchangeRateFor(cTokenAddr, cTokenDecimals, uTokenDecimals, block);
            } else if (token.isAave) {
                balance = await getCBalanceFor(cTokenAddr, cTokenDecimals, provider, block);
                exchangeRate = new BigNumber(1);
            }

            const totalValue = balance
                .multipliedBy(exchangeRate)
                .multipliedBy(10 ** uTokenDecimals)
                .integerValue(BigNumber.ROUND_UP);

            balances[uTokenAddr] = balances[uTokenAddr].plus(totalValue);
    }));

    return balances;
}

/*==================================================
  Metadata
==================================================*/
module.exports = {
    start: 1615564559, // Mar-24-2021 02:17:40 PM +UTC
    tvl,
};
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");
const { getConfig } = require('../helper/cache')

const configs = {
    'merlin': {
        tokens: [
            '0xF5b689D772e4Bd839AD9247A326A21a0A74a07f0', // aMBTC unkonw
            '0xC39E757dCb2b17B79A411eA1C2810735dc9032F8', // aSolvBTC
            '0xA984b70f7B41EE736B487D5F3D9C1e1026476Ea3', // aWBTC unkonw
            '0xB880fd278198bd590252621d4CD071b1842E9Bcd', // MBTC
            '0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71', // SolvBTC
        ],
        strategies: [
            '0xf05a5AfC180DBB10A3E1dd29235A6151e6088cC8',
            '0x6f0AfADE16BFD2E7f5515634f2D0E3cd03C845Ef',
            '0x631ae97e24f9F30150d31d958d37915975F12ed8',
            '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
            '0x0a5e1Fe85BE84430c6eb482512046A04b25D2484'
        ],
        unkownTokens: {
            '0xF5b689D772e4Bd839AD9247A326A21a0A74a07f0': '0xB880fd278198bd590252621d4CD071b1842E9Bcd',
            '0xA984b70f7B41EE736B487D5F3D9C1e1026476Ea3': '0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71'
        },
    },
    'bouncebit': {
        tokens: [
            '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC', // BBTC
            '0x7F150c293c97172C75983BD8ac084c187107eA19', // stBBTC
        ],
        strategies: [
            '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
            '0x4282868539C7E22B9Bc9248fd7c8196cDaeeEF13' // stBBTC
        ],
        unkownTokens: {
            '0x7F150c293c97172C75983BD8ac084c187107eA19': '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC'
        }
    },
    'btr': {
        tokens: [
            '0xd53E6f1d37f430d84eFad8060F9Fec558B36F6fa', // ZBTC
            '0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3', // stBTC
            '0xA984b70f7B41EE736B487D5F3D9C1e1026476Ea3', // aWBTC
            '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f' // WBTC
        ],
        strategies: [
            '0x5F42E359cC166D79e0468F3439F952c115984286',
            '0x6b5A0AFeDA7710dC9821855E7efd3d435cE21487',
            '0x6f0AfADE16BFD2E7f5515634f2D0E3cd03C845Ef',
            '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7'
        ],
        unkownTokens: {
            '0xd53E6f1d37f430d84eFad8060F9Fec558B36F6fa': '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f',
            '0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3': '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f',
            '0xA984b70f7B41EE736B487D5F3D9C1e1026476Ea3': '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f'
        }
    },
    'bsc': {
        tokens: [
            '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTCB
        ],
        strategies: [
            '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7'
        ],
        unkownTokens: {}
    }
}

const chains = [
    {
        name: 'merlin',
        chainId: 4200
    },
    {
        name: 'bouncebit',
        chainId: 6001
    },
    {
        name: 'btr',
        chainId: 200901
    },
    {
        name: 'bsc',
        chainId: 56
    }
]

module.exports = {};

chains.forEach(chain => {
    module.exports[chain.name] = {
        tvl: async function (api) {
            let config = { tokens: [], strategies: [], unkownTokens: {} };
            try {
                const data = await getConfig(`pell/tvl/${chain.name}`, `https://api.pell.network/v1/stakeList?chainId=${chain.chainId}`);
                data.result.forEach(f => {
                    config.tokens.push(f.underlineAddress);
                    config.strategies.push(f.strategyAddress);
                    if (f.sumToToken) {
                        config.unkownTokens[f.underlineAddress] = f.sumToToken;
                    }
                })
            } catch (error) {
                config = configs[chain.name];
            }
            const tokens = config.tokens;
            const strategies = config.strategies;
            const balances = await sumTokens2({ api, tokensAndOwners2: [tokens, strategies], skipFixBalances: true, isFetchFunction: true });
            if (config.unkownTokens) {
                Object.keys(config.unkownTokens).forEach(k => {
                    const amount = balances[api.chain + ':' + k.toLowerCase()];
                    sdk.util.sumSingleBalance(balances, config.unkownTokens[k].toLowerCase(), amount, api.chain);
                })
            }
            return balances;
        }
    }
})

const {
    dexType,
    flashloan,
    lendBorrow,
    em
} = require('./types.js');

/**
 * @typedef {Object} ContractDef
 * @property {String} contractType
 * @property {String} address
 * @property {Object} miscInfo
 */

/**
 * @typedef {Object} Dex
 * @property {String} dexType
 * @property {ContractDef[]} contracts
 */

/**
 * @typedef {Dex[]} NetworkDex
 */

/**
 * @type {NetworkDex}
 */
const eth = [
    {
        dexType: dexType.lendBorrow,
        contracts: [{
            contractType: lendBorrow.lender,
            address: '0xb3e1912fa5d9d219da8c65cda407cc998849428b',
            miscInfo: {
                tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
            }
        }, {
            contractType: lendBorrow.borrower,
            address: '0x8ac9425260b6da02db07da7980b09525ebf3b6a0',
            miscInfo: {
                tokenIn: '0xBcca60bB61934080951369a648Fb03DF4F96263C'
            }
        }, {
            contractType: lendBorrow.borrower,
            address: '0x45d5a790da3bfa305efca81eac652678ae3a90a6',
            miscInfo: {
                tokenIn: '0x028171bCA77440897B824Ca71D1c56caC55b68A3'
            }
        }]
    },
    {
        dexType: dexType.flashloan,
        contracts: [{
            contractType: flashloan.lp,
            address: '0x2e5a08c26cb22109e585784c4f99363bb3e199ab',
            miscInfo: {
                tokensIn: [
                    '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
                    '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
                    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                    '0x0000000000085d4780B73119b644AE5ecd22b376'
                ]
            }
        }]
    },
    {
        dexType: dexType.em,
        contracts: [{
            contractType: em.ep,
            address: '0x95142849d31eaa20b5b9ab746dff27ff400ce6bf',
            miscInfo: {
                token: '0x28e598846febb750effc384853fbce82988eaaa2'
            }
        }, {
            contractType: em.rp,
            address: '0xce596bf99d21e46fa91143c03d7a356682b67859',
            miscInfo: {
                token: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51'
            }
        }, {
            contractType: em.vps,
            address: '0xb7ead8c418f3d03bc22dd538c22600abe7209e72',
            miscInfo: {
                token: '0x57ab1ec28d129707052df4df418d58a2d46d5f51'
            }
        }, 
        
        {
            contractType: em.ep,
            address: '0x78E52d69fA8e0F036fFEF0BcDc4C289DB0DF63E2',
            miscInfo: {
                token: '0xba100000625a3754423978a60c9317c58a424e3D'
            }
        }, {
            contractType: em.rp,
            address: '0x87B46E49681E08E3adDF8A90F6a1fb5183079033',
            miscInfo: {
                token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
            }
        }, {
            contractType: em.vps,
            address: '0xcB72e764Ab46535aAD13cbF55b1F06cB15347A95',
            miscInfo: {
                token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
            }
        }]
    }
]

/**
 * @type {NetworkDex}
 */
const polygon = [
    {
        dexType: dexType.lendBorrow,
        contracts: [{
            contractType: lendBorrow.lender,
            address: '0x2F35d311fd2F0b0dA65FA268B86831279FB4fd98',
            miscInfo: {
                tokenIn: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
            }
        }, {
            contractType: lendBorrow.borrower,
            address: '0xbfb5215aD157Cd6C8B22494dC54Ff4B74bA18C09',
            miscInfo: {
                tokenIn: '0x1a13f4ca1d028320a707d99520abfefca3998b7f'
            }
        }, {
            contractType: lendBorrow.borrower,
            address: '0x0Cf91744D15684b91E6705e56f6dC820647B3067',
            miscInfo: {
                tokenIn: '0x27f8d03b3a2196956ed754badc28d73be8830a6e'
            }
        }]
    },
    {
        dexType: dexType.flashloan,
        contracts: [{
            contractType: flashloan.lp,
            address: '0xCAFDa65B1031535F1766C6b1E3b5efF5520c7C0f',
            miscInfo: {
                tokensIn: [
                    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
                    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
                ]
            }
        }]
    }
]


module.exports = {
    eth,
    polygon
}
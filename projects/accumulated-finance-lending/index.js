const ADDRESSES = require('../helper/coreAssets.json');
const BigNumber = require('bignumber.js').default;
const {sumTokens2} = require('../helper/unwrapLPs');

const config = {
    velas: [
        {
            "velas": {
                address: "0x0acbfff708c9d30684f620b2be23930284af12c5",
                collateralToken: "0x8f0ecda9679ad16e30be3d83d183c482821f5325"
            }
        }
    ],
    "zeta": [
        {
            "zeta": {
                address: '0x9b694d0ed151374989a4ec71d8a14764ae47f89d',
                collateralToken: '0x7ac168c81f4f3820fa3f22603ce5864d6ab3c547'
            }
        },
        {
            "zeta": {
                address: '0x540095363a3642bc6dde623825261851b71d1b71',
                collateralToken: '0x7ac168c81f4f3820fa3f22603ce5864d6ab3c547'
            }
        },
    ],
    "oasis": [
        {
            "sapphire": {
                address: '0xaf597bd499ded0575d1469f92a0472b4715f2b7e',
                collateralToken: '0x3cabbe76ea8b4e7a2c0a69812cbe671800379ec8'
            }
        }
    ],
    "bitkub": [{
        "bitkub": {
            address: "0xf38feedb0c85c1e1d6864c7513ac646d28bb0cfc",
            collateralToken: '0x7ac168c81f4f3820fa3f22603ce5864d6ab3c547'
        }
    }],
    "coti": [
        {
            "coti": {
                address: '0xc1641194a8a7ea9c19db00cd568f428f3e331740',
                collateralToken: '0x4781f0c82dc3ab55d79bd3956689d1b65fbd23ad'
            }
        }
    ],
};

function transformConfig(config) {
    const result = {};
    Object.values(config).forEach(chainArray => {
        chainArray.forEach(chainConfig => {
            Object.entries(chainConfig).forEach(([chain, item]) => {
                if (!result[chain]) result[chain] = [];
                result[chain].push(item);
            });
        });
    });
    return result;
}

module.exports = {
    methodology: "We aggregated lending and borrowing tokens issued by Accumulated Finance",
};

const transformedConfig = transformConfig(config);

// ABI

const totalAssetsABI = {
    type: "function",
    name: "totalAssets",
    stateMutability: "view",
    inputs: [],
    outputs: [{name: "", type: "uint256", internalType: "uint256"}]
};

const totalCollateralABI = {
    type: "function",
    name: "totalCollateral",
    stateMutability: "view",
    inputs: [],
    outputs: [{name: "", type: "uint256", internalType: "uint256"}]
};

const pricePerShareABI = {
    type: "function",
    name: "pricePerShare",
    inputs: [],
    outputs: [{name: "", type: "uint256", internalType: "uint256"}],
    stateMutability: "view"
};

const totalDebtSharesABI = {
    type: "function",
    name: "totalDebtShares",
    inputs: [],
    outputs: [{name: "", type: "uint256", internalType: "uint256"}],
    stateMutability: "view"
};

const getPricePerShareDebtABI

    = {
    type: "function",
    name: "getPricePerShareDebt",
    inputs: [],
    outputs: [{name: "", type: "uint256", internalType: "uint256"}],
    stateMutability: "view"
};

async function fetchDebtInfo(api, address) {
    return Promise.all([
        api.call({abi: totalDebtSharesABI, target: address}),
        api.call({abi: getPricePerShareDebtABI, target: address}),
    ]);
}

Object.entries(transformedConfig).forEach(([chain, configs]) => {
    module.exports[chain] = {
        tvl: async (api) => {
            await Promise.all(configs.map(async ({address, baseToken, collateralToken}) => {
                const [
                    totalCollateralsRaw,
                    totalAssetsRaw,
                    pricePerShareRaw,
                    [totalDebtSharesRaw, pricePerShareDebtRaw]
                ] = await Promise.all([
                    api.call({abi: totalCollateralABI, target: address}),
                    api.call({abi: totalAssetsABI, target: address}),
                    api.call({abi: pricePerShareABI, target: collateralToken}),
                    fetchDebtInfo(api, address)
                ]);
                const totalAssets = new BigNumber(totalAssetsRaw);
                const totalCollateral = new BigNumber(totalCollateralsRaw);
                const pricePerShare = new BigNumber(pricePerShareRaw);
                const totalDebtShares = new BigNumber(totalDebtSharesRaw);
                const pricePerShareDebt = new BigNumber(pricePerShareDebtRaw);
                const borrowed = (totalDebtShares.times(pricePerShareDebt)).div(1e18);
                const result = totalAssets.minus(borrowed).plus(totalCollateral.times(pricePerShare).div(1e18));
                api.add(baseToken ?? ADDRESSES.null, result.toFixed(0));
            }));
            return sumTokens2({ api });
        },
        borrowed: async (api) => {
            await Promise.all(configs.map(async ({address, baseToken}) => {
                const [totalDebtSharesRaw, pricePerShareDebtRaw] = await fetchDebtInfo(api, address);
                const totalDebtShares = new BigNumber(totalDebtSharesRaw);
                const pricePerShareDebt = new BigNumber(pricePerShareDebtRaw);
                const result = (totalDebtShares.times(pricePerShareDebt)).div(1e18);
                api.add(baseToken ?? ADDRESSES.null, result.toFixed(0));
            }));
            return sumTokens2({api});
        }
    }
})

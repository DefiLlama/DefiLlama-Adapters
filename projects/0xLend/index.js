var ethers = require("ethers");
const BigNumber = require("bignumber.js");

const CONFIG = {
    kcc: {
        rpc: "https://rpc-mainnet.kcc.network",
        compoundLens: '0xCA4D163Eeb21eeF70bF8Cbeb34E1e20D4C65d528',
        comptroller: '0x337d8719f70D514367aBe780F7c1eAd1c0113Bc7',
    },
    zksync: {
        rpc: "https://mainnet.era.zksync.io",
        compoundLens: '0xE852FF92FF6446658Dd770723a3a734409D7159c',
        comptroller: '0x599bb9202EE2D2F95EDe9f88F622854f7ef2c371',
    },
    blast: {
        rpc: "https://rpc.blast.io",
        compoundLens: '0x7C5d328A899410156417B833AA6DC424C9a0D89C',
        comptroller: '0x1DD821C9E27fB2399DAb75AedB113c80C755DCa6',
    }
}

const formatSourceData = (sourceData) => {
    const cleanData = {};
    for (const key in sourceData) {
        if (key !== '0' && !parseInt(key)) {
            cleanData[key] = sourceData[key];
        }
    }
    return cleanData;
};

const mergeColumnData = (market, index) => {
    console.log('mergeColumnData', market)
    return market.reduce((total, m) => {
        const partMarket = formatSourceData(m[index]);
        return {...total, ...partMarket};
    }, {});
};

const getNumber = (value, precision = 18) => {
    return new BigNumber(ethers.formatUnits(value, precision))
};


const getIndex = (name) => {
    return returnList.findIndex(i => i.name === name)
}

const formatMarket = (market) => {
    const getBignumber = (name) => {
        return market[0][getIndex(name)]
    }

    const decimals = Number(getBignumber('underlyingDecimals'));
    const cTokenDecimals = Number(getBignumber('cTokenDecimals'));
    const tokenPrice = Number(getNumber(market[1][1], decimals));

    const exchangeRateCurrent = Number(getNumber(
        getBignumber('exchangeRateCurrent'),
        18 - cTokenDecimals + decimals,
    ))
    const totalSupply = getNumber(getBignumber('totalSupply'), cTokenDecimals);
    const totalBorrows = getNumber(getBignumber('totalBorrows'), decimals);
    return {
        supply: Number(totalSupply.multipliedBy(tokenPrice).multipliedBy(exchangeRateCurrent)),
        borrow: Number(totalBorrows.multipliedBy(tokenPrice)),
    };
};

const mappingAllMarkets = (markets) => {
    const result = [];
    // 获取markets数量
    markets[0].forEach((_, index) => {
        result.push(formatMarket([markets[0][index], markets[2][index]]));
    })
    return result;
};
const returnList = [
    {
        "internalType": "address",
        "name": "cToken",
        "type": "address"
    },
    {
        "internalType": "uint256",
        "name": "cTokenDecimals",
        "type": "uint256"
    },
    {
        "internalType": "string",
        "name": "cTokenSymbol",
        "type": "string"
    },
    {
        "internalType": "string",
        "name": "cTokenName",
        "type": "string"
    },
    {
        "internalType": "address",
        "name": "underlyingAssetAddress",
        "type": "address"
    },
    {
        "internalType": "uint256",
        "name": "underlyingDecimals",
        "type": "uint256"
    },
    {
        "internalType": "string",
        "name": "underlyingSymbol",
        "type": "string"
    },
    {
        "internalType": "string",
        "name": "underlyingName",
        "type": "string"
    },
    {
        "internalType": "uint256",
        "name": "exchangeRateCurrent",
        "type": "uint256"
    },
    {
        "internalType": "uint256",
        "name": "supplyRatePerBlock",
        "type": "uint256"
    },
    {
        "internalType": "uint256",
        "name": "borrowRatePerBlock",
        "type": "uint256"
    },
    {
        "internalType": "uint256",
        "name": "reserveFactorMantissa",
        "type": "uint256"
    },
    {
        "internalType": "uint256",
        "name": "collateralFactorMantissa",
        "type": "uint256"
    },
    {
        "internalType": "uint256",
        "name": "totalBorrows",
        "type": "uint256"
    },
    {
        "internalType": "uint256",
        "name": "totalReserves",
        "type": "uint256"
    },
    {
        "internalType": "uint256",
        "name": "totalSupply",
        "type": "uint256"
    },
    {
        "internalType": "uint256",
        "name": "totalCash",
        "type": "uint256"
    },
    {
        "internalType": "bool",
        "name": "isListed",
        "type": "bool"
    },
    {
        "internalType": "uint256",
        "name": "borrowCap",
        "type": "uint256"
    }
];

const returnsStr = returnList.map((item) => item.type + ' ' + item.name).join(',');


const abi = ["function getAllMarketsData(address) view returns ((" + returnsStr + ")[], ()[], (address cToken, uint256 underlyingPrice)[])"]

const getResult = async (network) => {
    const provider = new ethers.JsonRpcProvider(CONFIG[network].rpc);
    const comptroller = CONFIG[network].comptroller;
    const compoundLens = CONFIG[network].compoundLens;
    const allMarketsData = await new ethers.Contract(
        compoundLens,
        abi,
        provider
    ).getAllMarketsData(comptroller);
    const allMarkets = mappingAllMarkets(allMarketsData)
    let tvl = 0,
        borrowed = 0;
    allMarkets.forEach((market) => {
        tvl += market.supply;
        borrowed += market.borrow;
    })
    return {
        tvl: 0,
        borrowed: 0,
    }
}
module.exports = {}

Object.keys(CONFIG).forEach(chain => {
    module.exports[chain] = {
        tvl: async () => {
            const result = await getResult(chain)
            return result['tvl']
        }
    }
})

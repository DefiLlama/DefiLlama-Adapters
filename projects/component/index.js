const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const {staking} = require("../helper/staking");

const cmp = "0x9f20Ed5f919DC1C1695042542C13aDCFc100dcab";
const ethStakingPool = "0x79876b5062160C107e02826371dD33c047CCF2de";

const translateToken = {
    '0xFe7ed09C4956f7cdb54eC4ffCB9818Db2D7025b8': "0x1456688345527be1f37e9e627da0837d6f08c925",
    '0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC': "0x6b175474e89094c44da98b954eedeac495271d0f",
    '0xDACD011A71f8c9619642bf482f1D4CeB338cfFCf': "0x1456688345527be1f37e9e627da0837d6f08c925",
    '0x3129aC70c738D398d1D74c87EAB9483FD56D16f8': "0x1456688345527be1f37e9e627da0837d6f08c925",
    '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E': "0x6b175474e89094c44da98b954eedeac495271d0f",
    '0x82f0B8B456c1A451378467398982d4834b6829c1': "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3"
}

const ethPools = [
    //POOLS
    {
        token: "0x49519631B404E06ca79C9C7b0dC91648D86F08db",
        underlying: [
            "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "0x1456688345527bE1f37E9e627DA0837D6f08C925"
        ]
    },
    {
        token: "0x6477960dd932d29518D7e8087d5Ea3D11E606068",
        underlying: [
            "0x1456688345527bE1f37E9e627DA0837D6f08C925",
            "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51"
        ]
    }
];

const xDaiPools = [
    //POOLS
    {
        token: "0x53De001bbfAe8cEcBbD6245817512F8DBd8EEF18",
        underlying: [
            "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
            "0xFe7ed09C4956f7cdb54eC4ffCB9818Db2D7025b8",
            "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d"
        ]
    },
    {
        token: "0xF82fc0ecBf3ff8e253a262447335d3d8A72CD028",
        underlying: [
            "0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC",
            "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d"
        ]
    },
    {
        token: "0xfbbd0F67cEbCA3252717E66c1Ed1E97ad8B06377",
        underlying: [
            "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
            "0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC",
            "0xD10Cc63531a514BBa7789682E487Add1f15A51E2",
            "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d"
        ]
    }
]

const bscPools = [
    //POOLS
    {
        token: "0xcf76a0ceDf50DA184FDef08A9d04E6829D7FefDF",
        underlying: [
            "0x55d398326f99059fF775485246999027B3197955",
            "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            "0xDACD011A71f8c9619642bf482f1D4CeB338cfFCf"
        ]
    },
    {
        token: "0x3Bb6Bf6EcBC71f8f78D1Eec9c91de4f8Fd5C891c",
        underlying: [
            "0x55d398326f99059fF775485246999027B3197955",
            "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
        ]
    }
]

const ftmPools = [
    //POOLS
    {
        token: "0xdDCA02Ddd94f97eeFE07fCcde780fD2FbDc85b23",
        underlying: [
            "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
            "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
            "0x3129aC70c738D398d1D74c87EAB9483FD56D16f8"
        ]
    },
    {
        token: "0x238139bF999f389063444e397cDfadF780ec57DB",
        underlying: [
            "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355",
            "0x82f0B8B456c1A451378467398982d4834b6829c1",
            "0x3129aC70c738D398d1D74c87EAB9483FD56D16f8"
        ]
    }
]

async function getTvlFromPools(balances, pools, block, chain) {
    for (let i in pools) {
        let underlyingBalances = (await sdk.api.abi.multiCall({
            calls: pools[i].underlying.map(p => ({
                target: p,
                params: pools[i].token
            })),
            abi: "erc20:balanceOf",
            block,
            chain
        })).output;
        for (let j in underlyingBalances) {
            if (underlyingBalances[j].input.target === "0xD10Cc63531a514BBa7789682E487Add1f15A51E2") {
                let bal = new BigNumber(underlyingBalances[j].output).div(10 ** 12).toFixed(0);
                sdk.util.sumSingleBalance(balances, "xdai:0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83", bal);
            }
            else if (underlyingBalances[j].input.target in translateToken) {
                sdk.util.sumSingleBalance(balances, translateToken[underlyingBalances[j].input.target], underlyingBalances[j].output);
            } else {
                sdk.util.sumSingleBalance(balances, `${chain}:${underlyingBalances[j].input.target}`, underlyingBalances[j].output);
            }
        }
    }
}

async function tvl(timestamp, block) {
    let balances = {};
    await getTvlFromPools(balances, ethPools, block, "ethereum");
    return balances;
}

async function xDaiTvl(timestamp, block, chainBlocks) {
    let balances = {};
    await getTvlFromPools(balances, xDaiPools, chainBlocks.xdai, "xdai");
    return balances;
}

async function bscTvl(timestamp, block, chainBlocks) {
    let balances = {};
    await getTvlFromPools(balances, bscPools, chainBlocks.bsc, "bsc");
    return balances;
}

async function ftmTvl(timestamp, block, chainBlocks) {
    let balances = {};
    await getTvlFromPools(balances, ftmPools, chainBlocks.fantom, "fantom");
    return balances;
}

module.exports = {
    ethereum: {
        tvl,
        staking: staking(ethStakingPool, cmp)
    },
    xdai: {
        tvl: xDaiTvl
    },
    bsc: {
        tvl: bscTvl
    },
    // fantom: {
    //     tvl: ftmTvl
    // },
    tvl: sdk.util.sumChainTvls([tvl, xDaiTvl, bscTvl/*, ftmTvl*/])
}
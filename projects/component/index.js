const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const {staking} = require("../helper/staking");

const cmp = "0x9f20Ed5f919DC1C1695042542C13aDCFc100dcab";
const ethStakingPool = "0x79876b5062160C107e02826371dD33c047CCF2de";

const translateToken = {
    '0xFe7ed09C4956f7cdb54eC4ffCB9818Db2D7025b8': "0x1456688345527be1f37e9e627da0837d6f08c925",
    '0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC': ADDRESSES.ethereum.DAI,
    '0xDACD011A71f8c9619642bf482f1D4CeB338cfFCf': "0x1456688345527be1f37e9e627da0837d6f08c925",
    '0x3129aC70c738D398d1D74c87EAB9483FD56D16f8': "0x1456688345527be1f37e9e627da0837d6f08c925",
    [ADDRESSES.fantom.DAI]: ADDRESSES.ethereum.DAI,
    [ADDRESSES.fantom.MIM]: "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3"
}

const ethPools = [
    //POOLS
    {
        token: "0x49519631B404E06ca79C9C7b0dC91648D86F08db",
        underlying: [
            ADDRESSES.ethereum.USDT,
            ADDRESSES.ethereum.USDC,
            "0x1456688345527bE1f37E9e627DA0837D6f08C925"
        ]
    },
    {
        token: "0x6477960dd932d29518D7e8087d5Ea3D11E606068",
        underlying: [
            "0x1456688345527bE1f37E9e627DA0837D6f08C925",
            ADDRESSES.ethereum.DAI,
            ADDRESSES.ethereum.sUSD
        ]
    }
];

const xDaiPools = [
    //POOLS
    {
        token: "0x53De001bbfAe8cEcBbD6245817512F8DBd8EEF18",
        underlying: [
            ADDRESSES.xdai.USDC,
            "0xFe7ed09C4956f7cdb54eC4ffCB9818Db2D7025b8",
            ADDRESSES.xdai.WXDAI
        ]
    },
    {
        token: "0xF82fc0ecBf3ff8e253a262447335d3d8A72CD028",
        underlying: [
            "0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC",
            ADDRESSES.xdai.WXDAI
        ]
    },
    {
        token: "0xfbbd0F67cEbCA3252717E66c1Ed1E97ad8B06377",
        underlying: [
            ADDRESSES.xdai.USDC,
            "0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC",
            "0xD10Cc63531a514BBa7789682E487Add1f15A51E2",
            ADDRESSES.xdai.WXDAI
        ]
    }
]

const bscPools = [
    //POOLS
    {
        token: "0xcf76a0ceDf50DA184FDef08A9d04E6829D7FefDF",
        underlying: [
            ADDRESSES.bsc.USDT,
            ADDRESSES.bsc.BUSD,
            "0xDACD011A71f8c9619642bf482f1D4CeB338cfFCf"
        ]
    },
    {
        token: "0x3Bb6Bf6EcBC71f8f78D1Eec9c91de4f8Fd5C891c",
        underlying: [
            ADDRESSES.bsc.USDT,
            ADDRESSES.bsc.BUSD,
            ADDRESSES.bsc.USDC
        ]
    }
]

const ftmPools = [
    //POOLS
    {
        token: "0xdDCA02Ddd94f97eeFE07fCcde780fD2FbDc85b23",
        underlying: [
            ADDRESSES.fantom.DAI,
            ADDRESSES.fantom.USDC,
            "0x3129aC70c738D398d1D74c87EAB9483FD56D16f8"
        ]
    },
    {
        token: "0x238139bF999f389063444e397cDfadF780ec57DB",
        underlying: [
            "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355",
            ADDRESSES.fantom.MIM,
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
                sdk.util.sumSingleBalance(balances, "xdai:" + ADDRESSES.xdai.USDC, bal);
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
}
const { sumTokensExport } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

const swapFlashLoan = {
    'BP1': "0x4bcb9Ea3dACb8FfE623317E0B102393A3976053C",
    'BP2': "0x6a63cbf00D15137756189c29496B14998b259254",
    'BP3': "0xE7E1b1F216d81a4b2c018657f26Eda8FE2F91e26",
    'BP4': "0xeC938Bc5b201E96b6AFE97070a8Ea967E0dcAe96"
};

const ADDRESSES = {
    'WBTC': "0x5832f53d147b3d6Cd4578B9CBD62425C7ea9d0Bd",
    "solvBTCb": "0x5b1fb849f1f76217246b8aaac053b5c7b15b7dc3",
    "solvBTCcore": "0x9410e8052bc661041e5cb27fdf7d9e9e842af2aa",
    "nBTC": "0x8BB97A618211695f5a6a889faC3546D1a573ea77",
    "BTCB": "0x7A6888c85eDBA8E38F6C7E0485212da602761C08",
    "pumpBTC": "0x5a2aa871954eBdf89b1547e75d032598356caad5",
    "solvBTCm": "0xe04d21d999faedf1e72ade6629e20a11a1ed14fa",
    "suBTC": "0xe85411c030fb32a9d8b14bbbc6cb19417391f711",
    "uBTC": "0xbb4a26a053b217bb28766a4ed4b062c3b4de58ce",
    "oBTC": "0x000734cf9e469bad78c8ec1b0deed83d0a03c1f8"
}

const owners = [
    swapFlashLoan.BP1,
    swapFlashLoan.BP2,
    swapFlashLoan.BP3,
    swapFlashLoan.BP4
]

const tokens = [
    ADDRESSES.WBTC,
    ADDRESSES.solvBTCb,
    ADDRESSES.solvBTCcore,
    ADDRESSES.BTCB,
    ADDRESSES.solvBTCm,
    ADDRESSES.uBTC,
    ADDRESSES.oBTC,
]

async function specialAssetsTVL(api) {
    const balances = {}

    // Special handling for nBTC
    const nBTCBalances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: owners.map(owner => ({
            target: ADDRESSES.nBTC,
            params: [owner]
        }))
    })
    const totalNbtc = nBTCBalances.reduce((a, b) => Number(a) + Number(b), 0)
    if (totalNbtc > 0) {
        sdk.util.sumSingleBalance(balances, 'bitcoin', totalNbtc / 1e8)
    }

    // Special handling for pumpBTC
    const pumpBTCBalances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: owners.map(owner => ({
            target: ADDRESSES.pumpBTC,
            params: [owner]
        }))
    })
    const totalPumpBtc = pumpBTCBalances.reduce((a, b) => Number(a) + Number(b), 0)
    if (totalPumpBtc > 0) {
        sdk.util.sumSingleBalance(balances, 'bitcoin', totalPumpBtc / 1e8)
    }

    // Special handling for suBTC
    const suBTCBalances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: owners.map(owner => ({
            target: ADDRESSES.suBTC,
            params: [owner]
        }))
    })
    const totalSuBtc = suBTCBalances.reduce((a, b) => Number(a) + Number(b), 0)
    if (totalSuBtc > 0) {
        sdk.util.sumSingleBalance(balances, 'bitcoin', totalSuBtc / 1e18)
    }

    return balances
}

module.exports = {
    core: {
        tvl: sdk.util.sumChainTvls([
            sumTokensExport({ tokens, owners }),
            specialAssetsTVL
        ])
    },
    methodology: "Counts all BTC-pegged tokens in the Bitflux liquidity pools including nBTC, pumpBTC, suBTC, WBTC, solvBTC variants, and others."
}
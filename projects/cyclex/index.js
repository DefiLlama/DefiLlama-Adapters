const AILAYER_COLLATERAL = {
    // BFBTC
    BFBTC: '0xC2236204768456B21eAfEf0d232Ba1FccCe59823',
    BFBTC_COLLATERAL_ASSET: '0xb3aCcC18A537C394e7D127413B752E1B5404FE05',
    // ABTC
    ABTC: '0x1470a4831F76954686BfB4dE8180F7469EA8dE6F',
    ABTC_COLLATERAL_ASSET: '0x8D3cF47809458879a69661a0270feA62b2495e9E',

}

async function ailayerTVL(api) {
    const bfbtcCollateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: AILAYER_COLLATERAL.BFBTC,
        params: [AILAYER_COLLATERAL.BFBTC_COLLATERAL_ASSET]
    })
    api.add(AILAYER_COLLATERAL.BFBTC, bfbtcCollateralBalance)

    const abtcCollateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: AILAYER_COLLATERAL.ABTC,
        params: [AILAYER_COLLATERAL.ABTC_COLLATERAL_ASSET]
    })
    api.add(AILAYER_COLLATERAL.ABTC, abtcCollateralBalance)
}

module.exports = {
    methodology: "TVL is fetched from CycleX collateral wallet",
    ailayer: {
        tvl: ailayerTVL
    },
}

const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
    doublecounted: true,
    methodology: "Counts total value locked in ERC4626 vaults",
}

const config = {
    ethereum: [
        "0x9847c14fca377305c8e2d10a760349c667c367d4",
    ],
    polygon: [
        "0xe7fe898a1ec421f991b807288851241f91c7e376",
        "0xa02aa8774e8c95f5105e33c2f73bdc87ea45bd29",
    ]
}

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
        hallmarks: [
            [1729675523, "Beta Launch"]
        ],
        tvl: sumERC4626VaultsExport({ vaults: config[chain], isOG4626: true, })
    }
})

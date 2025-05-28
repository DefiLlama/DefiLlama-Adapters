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
    ],
    base: [
        "0x7a63e8fc1d0a5e9be52f05817e8c49d9e2d6efae",
        "0xb272e80042634bca5d3466446b0c48ba278a8ae5",
    ],
}

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
        hallmarks: [
            [1729675523, "Beta Launch"],
            [1745312000, "V1 Launch"],
        ],
        tvl: sumERC4626VaultsExport({ vaults: config[chain], isOG4626: true, })
    }
})

const { treasuryExports } = require("../helper/treasury");


module.exports = treasuryExports({
  ethereum: {
    owners: [
        '0x7e9e4c0876B2102F33A1d82117Cc73B7FddD0032', '0x73F7261cF493105202F8dcbB11C126a65703dA55', '0xC4218226A5406Aa721EAEBc2D9dA9564AEdd7777',
        '0xc040340bDD2F40374e9751Db0342D0AC668ef7C8', '0x3cB580c041Cce953adfc2148e5BE6c1c893CCa9E'
    ],
    ownTokens: ['0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6'],
  },
  bsc: {
    owners: [
        '0xf92Bc9ee240B82A888c398e6965A7edcBF9399CF', '0xC4218226A5406Aa721EAEBc2D9dA9564AEdd7777'
    ],
    ownTokens: ['0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6'],
},
})
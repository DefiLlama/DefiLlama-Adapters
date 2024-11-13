const { treasuryExports } = require("../helper/treasury");


module.exports = treasuryExports({
  ethereum: {
    owners: [
        '0x7e9e4c0876B2102F33A1d82117Cc73B7FddD0032', // Treasury Main (MC)
        '0xA99F29A2fBdCaFbf057b3D8eFC47cfCEe670Bb43', // Treasury Main (BEAM)
        '0x73F7261cF493105202F8dcbB11C126a65703dA55', // Treasury 2
        '0xC4218226A5406Aa721EAEBc2D9dA9564AEdd7777', // Treasury 3
        '0x75A3820eE3F245Ecd4b77EB9b28fe5F8bfF77f15', // Treasury 5
        '0xc040340bDD2F40374e9751Db0342D0AC668ef7C8', 
        '0x3cB580c041Cce953adfc2148e5BE6c1c893CCa9E', // Merit Circle: Deployer
        '0xAeACFaAE1e084a952f1E6036F13bFe873f428f78', // Treasury Operational
        '0x07e0D811f266b7F65fD022bA4bDab562Ce067420', // Venture Investment
        '0x172FFFc69ED471B7fF2465aE97504985F7071593' // BEAM: Deployer
    ],
    ownTokens: ['0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6', '0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce'],
  },
  bsc: {
    owners: [
        '0xf92Bc9ee240B82A888c398e6965A7edcBF9399CF', '0xC4218226A5406Aa721EAEBc2D9dA9564AEdd7777'
    ],
    ownTokens: ['0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6', '0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce'],
  },
})

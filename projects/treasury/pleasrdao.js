const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const pleasrDaoTreasury = "0xF5c27c6fE782cbB5c85989ea3e75754748153459";
const treasury = "0xf894fea045eccb2927e2e0cb15c12debee9f2be8"
const lp = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        '0x300a902513815028e97FC79E92082Ce6a98d3b74',//SOX
        '0xbA6B0dbb2bA8dAA8F5D6817946393Aef8D3A4487',//HSF
        '0xBf9e72eEb5adB8B558334c8672950B7a379D4266',//CUBT
        "0xBAac2B4491727D78D2b78815144570b9f2Fe8899",
        ADDRESSES.ethereum.USDT,
        "0xc96F20099d96b37D7Ede66fF9E4DE59b9B1065b1",
        "0x4CD0c43B0D53bc318cc5342b77EB6f124E47f526",
        "0x1A4b46696b2bB4794Eb3D4c26f1c55F9170fa4C5",
        ADDRESSES.ethereum.DAI
     ],
    owners: [pleasrDaoTreasury, treasury, lp],
    resolveLP: true,
    resolveUniV3: true,
  },
})

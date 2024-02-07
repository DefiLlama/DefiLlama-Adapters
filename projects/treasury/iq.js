const ADDRESSES = require('../helper/coreAssets.json');
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x56398b89d53e8731bca8c1b06886cfb14bd6b654";
const IQ = "0x579CEa1889991f68aCc35Ff5c3dd0621fF29b0C9"

module.exports = treasuryExports({
  ethereum: {
    tokens: [
        nullAddress,
        ADDRESSES.ethereum.sfrxETH,
        ADDRESSES.ethereum.FRAX,
        "0x9D45081706102E7aadDD0973268457527722E274",
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.WBTC,
        "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
        "0xEF9F994A74CB6EF21C38B13553caa2E3E15F69d0"
     ],
    owners: [treasury],
    ownTokens: [IQ],
  },
})

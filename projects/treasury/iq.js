const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x56398b89d53e8731bca8c1b06886cfb14bd6b654";
const IQ = "0x579CEa1889991f68aCc35Ff5c3dd0621fF29b0C9"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xac3E018457B222d93114458476f3E3416Abbe38F",
        "0x853d955aCEf822Db058eb8505911ED77F175b99e",
        "0x9D45081706102E7aadDD0973268457527722E274",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
        "0xEF9F994A74CB6EF21C38B13553caa2E3E15F69d0"
     ],
    owners: [treasury],
    ownTokens: [IQ],
    
  },
})
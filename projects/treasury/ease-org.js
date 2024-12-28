const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x1f28ed9d4792a567dad779235c2b766ab84d8e33";
const EASE = "0xEa5eDef1287AfDF9Eb8A46f9773AbFc10820c61c";

module.exports = treasuryExports({
    ethereum: {
      tokens: [ 
          nullAddress,
          ADDRESSES.ethereum.DAI,
          ADDRESSES.ethereum.USDC,
          '0x7CA51456b20697A0E5Be65e5AEb65dfE90f21150',
          '0x43632E3448cd47440fEE797258081414D91A58cE',
       ],
      owners: [treasury],
      ownTokens: [EASE],
    },
  })
const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports } = require('../helper/utils');

// Treasury
const treasury = "0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9";
const GLM = "0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429";


module.exports = treasuryExports({
  ethereum: {
    tokens: [
      // Ethereum Assets
      nullAddress,
    ],
    owners: [treasury, '0x70a0a7be87deb51e1fab16d4f2bf00be1510e476', '0x3d4530082c3eb60f58af03f79b1ed3f40e591cd1'],
    ownTokens: [GLM]
  },
})

async function tvl(api) {
  if(api.timestamp > 1687828149){
    // Staked 100k ETH in validators
    api.add(ADDRESSES.null, 100e3*1e18)
  }
  return api.getBalances()
}

module.exports = mergeExports([module.exports, {
  ethereum: { tvl },
  
}])

module.exports.methodology = "The Golem Foundation has staked 100,000 ETH on top of what they hold on the treasury address. https://golem.foundation/2023/12/05/diva-announcement.html . Wallet that accrues the staking rewards https://etherscan.io/address/0xba1951dF0C0A52af23857c5ab48B4C43A57E7ed1"

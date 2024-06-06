const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')

const treasury = "0x439cac149b935ae1d726569800972e1669d17094" 
const virtue_token = "0x9416ba76e88d873050a06e5956a3ebf10386b863"
const stakingAddress = "0x0dd5a35fe4cd65fe7928c7b923902b43d6ea29e7" 
const treasuryTokens = [
    [ADDRESSES.ethereum.STETH, false], //stETH
   ]
module.exports = ohmTvl(treasury, treasuryTokens, "ethereum", stakingAddress, virtue_token, undefined, undefined, true)
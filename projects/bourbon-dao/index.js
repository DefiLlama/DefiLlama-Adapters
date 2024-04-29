const ADDRESSES = require('../helper/coreAssets.json')
const {ohmTvl} = require("../helper/ohm");

const whiskey = "0xce1ad4e2810e413e2e3684decc58a0bd01c907d9";
const stakingContract = "0x5e398c5da5353182aae7410fb824a1578fc518cb";

const treasury = "0x950d8c342bc6e0bcf9c1deb87d039947f35b3eb9";
const treasuryTokens = [
    [ADDRESSES.bsc.BUSD, false], // BUSD
    [ADDRESSES.bsc.USDT, false], // USDT
    [ADDRESSES.bsc.WBNB, false], // WBNB
    ["0x96b6d5482313eecc031afeb2fb32da2ba7439ba2", true], // WHISKEY-BUSD CAKELP
]

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "bsc", stakingContract, whiskey, undefined, undefined, false)
}
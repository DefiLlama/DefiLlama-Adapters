const { staking } = require('../helper/staking')
const { masterchefExports } = require('../helper/unknownTokens')

const bp = "0xACB8f52DC63BB752a51186D1c55868ADbFfEe9C1";
const masterchef = "0x6148104d39924f071DF05eeb2f6AEB53F7b2EFE7";
const stakingPools = [
    "0x8a8389D174081E585983DAB7189ea1Cf18F11896",
    "0xE051C61baBa59Fd9d184a26F15BE4361027c9916"
]
module.exports = masterchefExports({ chain: 'bsc', nativeToken: bp, masterchef, blacklistedTokens: ['0xe0f2df595207c392e13df940c7908a222b22747c'] })
module.exports.bsc.staking = staking(stakingPools, bp)

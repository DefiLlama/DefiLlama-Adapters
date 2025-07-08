const ADDRESSES = require('../helper/coreAssets.json')
const {ohmTvl} = require('../helper/ohm')

const transforms = {
    [ADDRESSES.boba.DAI]: ADDRESSES.ethereum.DAI,
    [ADDRESSES.boba.USDC]: ADDRESSES.ethereum.USDC,
}

module.exports={
    ...ohmTvl("0xbfFC76cDC85A496404662dc7D8A270cE9567C544", [
        [ADDRESSES.boba.DAI, false], //dai
        ["0xF582bC0437a1F1D0476f3a0c8efeEc8d05E6bc96", true],
        ["0x32fDfeA5CdCe7E417818ed5093E8bD4cA85dfE06", true],
        [ADDRESSES.boba.USDC, false] //usdc
    ], "boba", "0xAECFc89Da2f125D893Da6Fb6d157b5DfF1F0aD9E",
    "0xaC3a4aF1778203c8B651dAfA73cEd5b79c80F239", addr=>
        transforms[addr.toLowerCase()] ,
        undefined, false)
}
module.exports.deadFrom = '2022-01-16' 
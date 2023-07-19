const ADDRESSES = require('../helper/coreAssets.json')
const {ohmTvl} = require("../helper/ohm");

const scr = "0x8183C18887aC4386CE09Dbdf5dF7c398DAcB2B5a";
const treasury = "0xa39b5f217EdBDe068b4D3fA98256244ef74774a1";
const stakingContract = "0x3d97040e407078823891C59BB07eadb2dDF3AE32"

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, [
        [ADDRESSES.fantom.MIM, false], // MIM
        ["0x468c174cc015d4a697586C0a99F95E045F7e6f91", true] // scrMim SPIRIT LP
    ], "fantom", stakingContract, scr, undefined, undefined, false)
}
const {compoundExports} = require('../helper/compound')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports={
    timetravel: true,
    doublecounted: false,
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",    
    kava:{
        ...compoundExports("0x3A4Ec955a18eF6eB33025599505E7d404a4d59eC", "kava", "0xb51eFaF2f7aFb8a2F5Be0b730281E414FB487636", ADDRESSES.kava.WKAVA)
    }
}

const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports2 } = require("../helper/compound");

module.exports = {
	btr: compoundExports2({ cether: '0xe277Aed3fF3Eb9824EdC52Fe7703DF0c5ED8B313', comptroller: '0xe688a4a94AD1D32CD52A01306fc0a9552749F322', cetheEquivalent: ADDRESSES.btr.WBTC })
};
const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports2 } = require("../helper/compound");

module.exports = {
	iotex: compoundExports2({
		cether: '0x83C51de03f03C5E23f02F674dbD2032e164112Fc',
		comptroller: '0x47D7B83947Aa12fEb95f5f55527Dc9B32E4ec009',
		cetheEquivalent: ADDRESSES.iotex.WIOTX
	})
};
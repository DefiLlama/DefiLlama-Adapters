const { treasuryExports } = require("../helper/treasury");
const { nullAddress } = require('../helper/tokenMapping');

const mainTreasury = '0x776e9df67667cb568f0e7951f74347fd985d615b';
const multisig = '0xacB39b9Bf0462203b4Ca0CB74eC1AffB1b17c3b6';


module.exports = treasuryExports({
	arbitrum: {
		tokens: [nullAddress],
		owners: [mainTreasury, multisig]
	},
	avax: {
		tokens: [nullAddress],
		owners: [mainTreasury, multisig]
	},
	optimism: {
		tokens: [nullAddress],
		owners: [mainTreasury, multisig]
	},
	manta: {
		tokens: [nullAddress],
		owners: [mainTreasury, multisig]
	},
	base: {
		tokens: [nullAddress],
		owners: [mainTreasury, multisig]
	},
	pulse: {
		tokens: [nullAddress],
		owners: [mainTreasury, multisig]
	}
})
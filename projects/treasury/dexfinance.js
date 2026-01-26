const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { treasuryExports } = require("../helper/treasury");

const mainTreasury = '0x776e9df67667cb568f0e7951f74347fd985d615b';
const multisig = '0xacB39b9Bf0462203b4Ca0CB74eC1AffB1b17c3b6';


module.exports = treasuryExports({
	arbitrum: {
		owners: [mainTreasury, multisig],
		tokens: [
			ADDRESSES.arbitrum.USDC,
			ADDRESSES.arbitrum.WETH,
			'0x92a212d9f5eef0b262ac7d84aea64a0d0758b94f', //gdex
			'0x4117ec0a779448872d3820f37ba2060ae0b7c34b', //usdex
			'0x1b896893dfc86bb67cf57767298b9073d2c1ba2c', //cake
			'0x6985884c4392d348587b19cb9eaaf157f13271cd', //zro
			'0xd56734d7f9979dd94fae3d67c7e928234e71cd4c', //tia
			'0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8', //pendle
			'0x25d887ce7a35172c62febfd67a1856f20faebb00', //pepe
			ADDRESSES.arbitrum.LINK, //link
			ADDRESSES.arbitrum.GMX, //gmx
			ADDRESSES.arbitrum.ARB, //arb
			ADDRESSES.arbitrum.WBTC, //wbtc
		]
	},
	avax: {
		owners: [mainTreasury],
		tokens: [
			ADDRESSES.avax.USDT_e,
			ADDRESSES.avax.WETH_e,
		]
	},
	optimism: {
		owners: [mainTreasury],
		tokens: [
			ADDRESSES.optimism.OP,
			ADDRESSES.optimism.WETH,
			ADDRESSES.optimism.USDC,
		]
	},
	manta: {
		owners: [mainTreasury],
		tokens: [
			ADDRESSES.manta.USDC,
			'0x95cef13441be50d20ca4558cc0a27b601ac544e5', //MANTA
			'0x4c2a0f964a37a3ce305fe41c575beeb48c8c3fa2', //gCETO
			'0x3af03e8c993900f0ea6b84217071e1d4cc783982', //CETO
			'0xe68874e57224d1e4e6d4c6b4cf5af7ca51867611', //bCETO
			'0x6da9ebd271a0676f39c088a2b5fd849d5080c0af', //USDEX
		]
	},
	// pulse: {
	// 	owners: [mainTreasury],
	// 	tokens: [
	// 		ADDRESSES.pulse.WETH,
	// 		ADDRESSES.ethereum.USDC, //usdc(fork)
	// 		ADDRESSES.pulse.sDAI, //sdai
	// 		'0xaa2c47a35c1298795b5271490971ec4874c8e53d', //usdex
	// 		'0x6386704cd6f7a584ea9d23ccca66af7eba5a727e', //spark
	// 	]
	// },
	base: {
		owners: [mainTreasury],
		tokens: [
			ADDRESSES.base.USDC,
			'0x532f27101965dd16442e59d40670faf5ebb142e4', //brett
			'0xece7b98bd817ee5b1f2f536daf34d0b6af8bb542', //rock
			'0x5babfc2f240bc5de90eb7e19d789412db1dec402', //circle
			'0x6921b130d297cc43754afba22e5eac0fbf8db75b', //doginme
			'0x7d9ce55d54ff3feddb611fc63ff63ec01f26d15f', //fungi
			'0xcde90558fc317c69580deeaf3efc509428df9080', //normilio
			'0xba0dda8762c24da9487f5fa026a9b64b695a07ea', //ox
			'0xa3d1a8deb97b111454b294e2324efad13a9d8396', //ovn
			'0xb79dd08ea68a908a97220c76d19a6aa9cbde4376', //usd+
			'0x940181a94a35a4569e4529a3cdfb74e38fd98631', //aero
			'0x7f62ac1e974d65fab4a81821ca6af659a5f46298', //wels
			'0x78b3c724a2f663d11373c4a1978689271895256f', //tkn
			ADDRESSES.base.wstETH, //wsteth
			'0x373504da48418c67e6fcd071f33cb0b3b47613c7', //wbasedoge
		]
	},
})
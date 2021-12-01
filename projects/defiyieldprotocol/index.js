const { tokenHolderBalances } = require('../helper/tokenholders')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')

const contractFarms = {
	ethereum: [
		"0xa7d6F5fa9b0be0e98b3b40E6aC884e53F2F9460e",
		"0x0b0A544AE6131801522E3aC1FBAc6D311094c94c",
		"0x16cAaD63BDFC3Ec4A2850336B28efE17e802b896",
		"0x512FF8739d39e55d75d80046921E7dE20c3e9BFf",
		"0xeF71DE5Cb40f7985FEb92AA49D8e3E84063Af3BB",
		"0x8B0e324EEdE360CaB670a6AD12940736d74f701e",
		"0x78e2dA2eda6dF49BaE46E3B51528BAF5c106e654",
		"0x350F3fE979bfad4766298713c83b387C2D2D7a7a",
		"0x2b5D7a865A3888836d15d69dCCBad682663DCDbb",
		"0xa52250f98293c17C894d58cf4f78c925dC8955d0",
		"0x924BECC8F4059987E4bc4B741B7C354FF52c25e4",
		"0xbE528593781988974D83C2655CBA4c45FC75c033",
		"0x4a76Fc15D3fbf3855127eC5DA8AAf02DE7ca06b3",
		"0xF4abc60a08B546fA879508F4261eb4400B55099D",
		"0x13F421Aa823f7D90730812a33F8Cac8656E47dfa",
		"0x86690BbE7a9683A8bAd4812C2e816fd17bC9715C",
		"0x7Fc2174670d672AD7f666aF0704C2D961EF32c73",
		"0x036e336eA3ac2E255124CF775C4FDab94b2C42e4",
		"0x0A32749D95217b7Ee50127E24711c97849b70C6a",
		"0x82df1450eFD6b504EE069F5e4548F2D5Cb229880",
		"0xe5262f38bf13410a79149cb40429f8dc5e830542"
	],
	bsc: [
		"0x8a607e099e835bdbc4a606acb600ef475414f450",
		"0x34dd0d25fa2e3b220d1eb67460c45e586c61c2bb",
		"0xb07c67b65e6916ba87b6e3fa245aa18f77b4413e",
		"0x52adfbb5bc9f9fee825bd56feb11f1fc90e0b47e",
		"0xb4338fc62b1de93f63bfedb9fd9bac455d50a424",
		"0x2c1411d4f1647b88a7b46c838a3760f925bac83b",
		"0x2c51df297a2aa972a45ed52110afd24591c6f302",
		"0xd7180d6fea393158d42d0d0cd66ab93048f581e3",
		"0x111ae4ca424036d09b4e0fc9f1de5e6dc90d586b",
		"0x7637fa253180556ba486d2fa5d2bb328eb0aa7ca",
		"0x2f3c4a08dad0f8a56ede3961ab654020534b8a8c",
		"0x417538f319afddd351f33222592b60f985475a21",
		"0x350f3fe979bfad4766298713c83b387c2d2d7a7a",
		"0xf13aDbEb27ea9d9469D95e925e56a1CF79c06E90",
		"0xaF411BF994dA1435A3150B874395B86376C5f2d5",
		"0x9af074cE714FE1Eb32448052a38D274E93C5dc28",
		"0xDBfb96e2899d52B469C1a1C35eD71fBBa228d2cC",
		"0xc794cDb8D6aC5eB42d5ABa9c1E641ae17c239c8c",
		"0x23609B1f5274160564e4afC5eB9329A8Bf81c744",
		"0x264922696b9972687522b6e98Bf78A0430E2163C",
		"0x9DF0A645BeB6F7aDFaDC56f3689E79405337EFE2",
		"0xbd574278fEbad04b7A0694C37DeF4f2ecFa9354A",
		"0x537DC4fee298Ea79A7F65676735415f1E2882F92",
		"0x219717BF0bC33b2764A6c1A772F75305458BDA3d",
		"0xD1151a2434931f34bcFA6c27639b67C1A23D93Af",
		"0xed869Ba773c3F1A1adCC87930Ca36eE2dC73435d",
		"0x415B1624710296717FA96cAD84F53454E8F02D18",
	],
	avax: [
		"0x499c588146443235357e9c630a66d6fe0250caa1",
		"0xd8af0591be4fba56e3634c992b7fe4ff0a90b584",
		"0xbebe1fe1444a50ac6ee95ea25ba80adf5ac7322c",
		"0x79be220ab2dfcc2f140b59a97bfe6751ed1579b0",
		"0x4c7e0cbb0276a5e963266e6b9f34db73a1cb73f3"
	]
}

const dyp = "0x961C8c0B1aaD0c0b10a51FeF6a867E3091BCef17"

const lps = {
	ethereum: [
		"0xba7872534a6c9097d805d8bee97e030f4e372e54",
		"0x44b77e9ce8a20160290fcbaa44196744f354c1b7",
		"0xabd9c284116b2e757e3d4f6e36c5050aead24e0c",
		"0x76911e11fddb742d75b83c9e1f611f48f19234e4",
	],
	bsc: [
		"0x2fcf1b0d83f83135b6e5e2e231e07ae89c235f68",
		"0x87c546525cf48f28d73ea218c625d6f748721717",
		"0xc7a4d04699a9539d33e86ce746e88553149c8528",
		"0x1bC61d08A300892e784eD37b2d0E63C85D1d57fb"
	],
	avax: [
		"0x497070e8b6C55fD283D8B259a6971261E2021C01"
	]
}

function transform(chain) {
	return (addr) => {
		if (addr === dyp) {
			return dyp
		}
		return chain + ':' + addr
	}
}

function staking(chain) {
	return async (time, ethBlock, chainBlocks) => {
		const balances = {}
		await sumTokensAndLPsSharedOwners(balances, [[dyp, false]], contractFarms[chain], chainBlocks[chain], chain, transform(chain))
		return balances
	}
}

function pool2(chain) {
	return async (time, ethBlock, chainBlocks) => {
		const balances = {}
		await sumTokensAndLPsSharedOwners(balances, lps[chain].map(lp => [lp, true]), contractFarms[chain], chainBlocks[chain], chain, transform(chain))
		return balances
	}
}

module.exports = {
	start: 1619654324,        // Apr-28-2021 23:58:44 PM +UTC
	avalanche: {
		staking: staking("avax"),
		pool2: pool2("avax"),
	},
	bsc: {
		staking: staking("bsc"),
		pool2: pool2("bsc"),
	},
	ethereum: {
		staking: staking("ethereum"),
		pool2: pool2("ethereum"),
		tvl: tokenHolderBalances([
			{
				tokens: [
					'0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5', // cETH Token
					'0xccF4429DB6322D5C611ee964527D42E5d685DD6a', // cWBTC Token
					'0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9', // cUSDT Token
					'0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC Token
					'0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', // cDAI Token
				],
				holders: [
					'0x01de5bCe5C5Ee4F92e8f4183f6F4E4f12f9a86cd', // cETH Vault 3 Days Lock
					'0x3e488684c40D63Ff2b9963DFBb805Bbb3Da9b1c6', // cETH Vault 30 Days Lock
					'0x480c83Be2694BFB91F40d951424330c9123b9066', // cETH Vault 60 Days Lock
					'0xdC68450BfE4E16d74B20c44DdA83662cF2F5F0c0', // cETH Vault 90 Days Lock
					'0xe5c5a452A0f7B2d5266010Bf167A7Ee2eDF54533', // cWBTC Vault 3 Days Lock
					'0x8Ae8eC53712017EeB3378Ee112082D57da98E792', // cWBTC Vault 30 Days Lock
					'0x2D4b96e3C6176E833c013088aEcC7640af977e20', // cWBTC Vault 60 Days Lock
					'0xb95Ec2cB2D61d12c86a05e0c995d007Aec8f2850', // cWBTC Vault 90 Days Lock
					'0x18d2a323675BbE1f9d03e273a186Aea8ADf7f5c5', // cUSDT Vault 3 Days Lock
					'0xfB55dcc985517d111C65004f0EAabC1f6CE23cF1', // cUSDT Vault 30 Days Lock
					'0x8CE610eC56cE3ad3678C426f0Dfc965568Db6DdC', // cUSDT Vault 60 Days Lock
					'0x7CCFF41652eD12278E02E18de06d40Aaf5F1769B', // cUSDT Vault 90 Days Lock
					'0x94226Ae99C786b2830d27aC6e8fCdb4b0c4cc73a', // cUSDC Vault 3 Days Lock
					'0xaaC6814a1aCFE8F7Ea1f718148daC614d5323c85', // cUSDC Vault 30 Days Lock
					'0xe19328D2A528B765E30f9BC47faBb81e0f510ea9', // cUSDC Vault 60 Days Lock
					'0xE728874B81Bd0b7a9c3505949935e67D0e7136aD', // cUSDC Vault 90 Days Lock
					'0x8c1d0FD28b5FEac7f5521d05D53d7E1560A7CBCC', // cDAI Vault 30 Days Lock
					'0xF73baaC19eEEB7C4B7Cc211F3eDF88BB9F1d40f9', // cDAI Vault 30 Days Lock
					'0x8Fb2c9F8c07FaCf0aF442a1900cD2Cfe1940971B', // cDAI Vault 60 Days Lock
					'0x8ad8e5FA0f2781dA3327275049B5469275A1042E', // cDAI Vault 90 Days Lock
				],
				checkETHBalance: true,
			}
		]),

	}
}

const ADDRESSES = require("../helper/coreAssets.json");

// https://mezo.org/docs/users/resources/contracts-reference

// Ethereum tokens locked in bridge contracts
const ethereumTokens = [
	ADDRESSES.ethereum.tBTC,
	ADDRESSES.ethereum.WBTC,
	ADDRESSES.ethereum.DAI,
	ADDRESSES.ethereum.USDT,
	ADDRESSES.ethereum.USDC,
	ADDRESSES.ethereum.CRVUSD,
	ADDRESSES.ethereum.USDe,
	ADDRESSES.mantle.FBTC, // fBTC
	"0x7A56E1C57C7475CCf742a1832B028F0456652F97", // solvBTC
	"0xd9D920AA40f578ab794426F5C90F6C731D159DEf", // solvBTC.bbn
	"0x8DB2350D78aBc13f5673A411D4700BCF87864dDE", // swBTC
	ADDRESSES.ethereum.cbBTC, // cbBTC
	"0xCFC5bD99915aAa815401C5a41A927aB7a38d29cf", // thUSD
	"0xCdF7028ceAB81fA0C6971208e83fa7872994beE5", // T
	ADDRESSES.mezo.MUSD,
];

// Ethereum bridge contracts
const mezoPreMainnetBridge = "0xAB13B8eecf5AA2460841d75da5d5D861fD5B8A39";
const mezoMainnetBridge = "0xF6680EA3b480cA2b72D96ea13cCAF2cFd8e6908c";

// MUSD NTT manager on Ethereum (Wormhole bridge for MUSD)
const musdNttManager = "0x5293158bf7a81ED05418DA497a80F7e6Dbf4477E";

// Mezo chain pool contracts
const mezoPools = [
	"0x52e604c44417233b6CcEDDDc0d640A405Caacefb", // MUSD/BTC Pool
	"0xEd812AEc0Fecc8fD882Ac3eccC43f3aA80A6c356", // MUSD/mUSDC Pool
	"0x10906a9E9215939561597b4C8e4b98F93c02031A", // MUSD/mUSDT Pool
	"0x72E6b3F126cF4F6C90C08114aC29038A0E269210", // mcbBTC/BTC Pool
	"0x5Cd2A025C001E07Ae354A4C22C3009908De1aC59", // mSolvBTC/MUSD Pool
	"0xf6f950485b0A65828F07581Ca979ef1271778d6A", // mSolvBTC/BTC Pool
];

// Mezo chain tokens that may be held in pools
const mezoChainTokens = [
	ADDRESSES.mezo.BTC,
	ADDRESSES.mezo.MUSD,
	ADDRESSES.mezo.mUSDC,
	ADDRESSES.mezo.mUSDT,
	ADDRESSES.mezo.mcbBTC,
	ADDRESSES.mezo.mSolvBTC,
	ADDRESSES.mezo.mDAI,
	ADDRESSES.mezo.mFBTC,
	ADDRESSES.mezo.mswBTC,
	ADDRESSES.mezo.mT,
	ADDRESSES.mezo.mUSDe,
];

async function ethereumTvl(api) {
	return api.sumTokens({
		owners: [mezoPreMainnetBridge, mezoMainnetBridge, musdNttManager],
		tokens: ethereumTokens,
	});
}

async function mezoChainTvl(api) {
	return api.sumTokens({ owners: mezoPools, tokens: mezoChainTokens });
}

module.exports = {
	hallmarks: [['2025-05-23', "Mezo Mainnet Migration"]],
	ethereum: { tvl: ethereumTvl },
	mezo: { tvl: mezoChainTvl },
};

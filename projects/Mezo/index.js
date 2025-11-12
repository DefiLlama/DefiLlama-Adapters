const ADDRESSES = require("../helper/coreAssets.json");

// https://mezo.org/docs/users/resources/contracts-reference

const mezoTokens = [
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

const mezoPreMainnetBridge = "0xAB13B8eecf5AA2460841d75da5d5D861fD5B8A39";

//https://github.com/mezo-org/mezod/blob/main/ethereum/bindings/portal/mainnet/gen/_address/MezoBridge
const mezoMainnetBridge = "0xF6680EA3b480cA2b72D96ea13cCAF2cFd8e6908c";

const getTvl = async (api, owners) => {
	return api.sumTokens({
		api,
		owner: [owners],
		tokens: mezoTokens,
	});
};

async function tvl(api) {
	const [preMigrationTvl, currentTvl] = await Promise.all([
		getTvl(api, mezoPreMainnetBridge),
		getTvl(api, mezoMainnetBridge),
	]);
	return {
		...preMigrationTvl,
		...currentTvl,
	};
}

module.exports = {
	hallmarks: [[1747987200, "Mezo Mainnet Migration"]],
	ethereum: { tvl },
  // mezo: { tvl },
};
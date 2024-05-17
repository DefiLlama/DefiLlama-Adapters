const { compoundExports } = require("../helper/compound");

function tvl() {
	const funcs = compoundExports(
		"0xe688a4a94AD1D32CD52A01306fc0a9552749F322", //controller,
		"btr",
		"0xe277Aed3fF3Eb9824EdC52Fe7703DF0c5ED8B313", // cETHAddress,
		"0xfF204e2681A6fA0e2C3FaDe68a1B28fb90E4Fc5F" // "0x0000000000000000000000000000000000000000"
	);

	// const getData = async () => {
	// 	let res = await funcs.tvl();
	// 	// console.debug(res);

	// 	res = await funcs.borrowed();
	// 	// console.debug(res);
	// };
	// getData();

	return funcs;
}

module.exports = {
	timetravel: true,
  misrepresentedTokens: false,
	btr: tvl()
};
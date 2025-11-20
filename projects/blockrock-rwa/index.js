const QQQAI_ADDRESS = "0xa91D704B6edA6e207413bB888bd1B00e3037Dd24";

async function tvl(api) {
	const totalSupply = await api.call({
		abi: "erc20:totalSupply",
		target: QQQAI_ADDRESS,
	});
	api.add(QQQAI_ADDRESS, totalSupply);
}

module.exports = {
	methodology: "TVL is the total supply of QQQAI tokens in the QQQAI contract.",
	ethereum: {
		tvl,
	},
};

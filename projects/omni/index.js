//node test.js projects/omni/index.js

const tokenToCoingecko = {
	vBNC: "voucher-bnc",
	vDOT: "voucher-dot",
	vGLMR:'voucher-glmr',
	vFIL:'voucher-fil',
	vASTR:'voucher-astr',
	vKSM:'voucher-ksm',
	vMOVR:'voucher-movr',
};

function formatTokenAmount(amount, tokenSymbol) {
	let decimals = 12;

	switch (tokenSymbol) {
		case "vDOT":
			decimals = 10;
			break;

		case "vBNC":
		case "vKSM":
			decimals = 12;
			break;
		case "vASTR":
		case "vGLMR":
		case "vFIL":
		case "vMOVR":
			decimals = 18;
			break;
	}

	return Number(amount / Number(10 ** decimals));
}


module.exports = {
	timetravel: false,
	moonbeam: {
		tvl: async (_, _1, _2, { api }) => {
			const tokens = [
				{ token: "0xFFFfffFf15e1b7E3dF971DD813Bc394deB899aBf", label: "vDOT" },
				{ token: "0xFfFfFFff99dABE1a8De0EA22bAa6FD48fdE96F6c", label: "vGLMR" },
				{ token: "0xFffffFffCd0aD0EA6576B7b285295c85E94cf4c1", label: "vFIL" },
			];

			const totalLiquidity = {};
			await Promise.all(
				tokens.map(async ({ token, label }) => {
					totalLiquidity[label] = await api.call({
						target: token,
						abi: "uint256:totalSupply",
					});
				})
			);
			const totalLiquidityFormatted = {};
			for (const key in totalLiquidity) {
				totalLiquidityFormatted[tokenToCoingecko[key]] = formatTokenAmount(
					totalLiquidity[key],
					key
				);
			}

			return totalLiquidityFormatted;
		},
	},
	astar: {
		tvl: async (_, _1, _2, { api }) => {
			const tokens = [
				{ token: "0xFfFfFfff00000000000000010000000000000008", label: "vDOT" },
				{ token: "0xfffFffff00000000000000010000000000000010", label: "vASTR" },
			];

			const totalLiquidity = {};
			await Promise.all(
				tokens.map(async ({ token, label }) => {
					totalLiquidity[label] = await api.call({
						target: token,
						abi: "uint256:totalSupply",
					});
				})
			);
			const totalLiquidityFormatted = {};
			for (const key in totalLiquidity) {
				totalLiquidityFormatted[tokenToCoingecko[key]] = formatTokenAmount(
					totalLiquidity[key],
					key
				);
			}

			return totalLiquidityFormatted;
		},
	},
	moonriver: {
		tvl: async (_, _1, _2, { api }) => {
			const tokens = [
				{ token: "0xFFffffff3646A00f78caDf8883c5A2791BfCDdc4", label: "vBNC" },
				{ token: "0xFFffffFFC6DEec7Fc8B11A2C8ddE9a59F8c62EFe", label: "vKSM" },
				{ token: "0xfFfffFfF98e37bF6a393504b5aDC5B53B4D0ba11", label: "vMOVR" },
			];

			const totalLiquidity = {};
			await Promise.all(
				tokens.map(async ({ token, label }) => {
					totalLiquidity[label] = await api.call({
						target: token,
						abi: "uint256:totalSupply",
					});
				})
			);
			const totalLiquidityFormatted = {};
			for (const key in totalLiquidity) {
				totalLiquidityFormatted[tokenToCoingecko[key]] = formatTokenAmount(
					totalLiquidity[key],
					key
				);
			}

			return totalLiquidityFormatted;
		},
	}
};

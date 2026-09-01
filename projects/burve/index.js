const BERACHAIN = "0xa1beD164c12CD9479A1049f97BDe5b3D6EC21089";

const getClosureValueAbi =
	"function getClosureValue(uint16 closureId) view returns (uint8 n, uint256 targetX128, uint256[16] balances, uint256 valueStaked, uint256 bgtValueStaked)";

const getTokensAbi = "function getTokens() external view returns (address[] memory)";

const decimalsAbi = "function decimals() external view returns (uint8)";

// Helper to normalize balances to 18 decimals
function toReal(amount, decimals) {
	return amount / 10n ** BigInt(18 - decimals);
}

module.exports = {
	methodology: "Sum of all tokens in the closure",
	start: 6660733,
	berachain: {
		tvl: async (api) => {
			// Fetch tokens dynamically from the contract
			const fetchedTokens = await api.call({
				abi: getTokensAbi,
				target: BERACHAIN,
			});

			// Fetch decimals for each token
			const tokenDecimals = await api.multiCall({
				abi: decimalsAbi,
				calls: fetchedTokens.map((token) => ({
					target: token,
				})),
			});

			const numTokens = fetchedTokens.length;
			const closureIds = [];
			for (let i = 3; i < 1 << numTokens; i++) {
				closureIds.push(i);
			}

			const closureValues = await api.multiCall({
				abi: getClosureValueAbi,
				calls: closureIds.map((id) => ({
					target: BERACHAIN,
					params: [id],
				})),
				permitFailure: true,
			});

			// Sum balances for each token index
			const tokenBalances = Array(numTokens).fill(0n);
			for (const closure of closureValues) {
				if (!closure || !closure.balances) continue;
				for (let i = 0; i < numTokens; i++) {
					tokenBalances[i] += BigInt(closure.balances[i] || 0);
				}
			}

			for (let i = 0; i < numTokens; i++) {
				const balance = toReal(tokenBalances[i], tokenDecimals[i]);
				api.add(fetchedTokens[i], balance.toString());
			}
		},
	},
};

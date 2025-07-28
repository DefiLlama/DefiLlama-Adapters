const BERACHAIN = "0xa1beD164c12CD9479A1049f97BDe5b3D6EC21089"

const tokens = [
    "0x549943e04f40284185054145c6E4e9568C1D3241",
    "0x779Ded0c9e1022225f8E0630b35a9b54bE713736",
    "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
    "0x1cE0a25D13CE4d52071aE7e02Cf1F6606F4C79d3",
    "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
	"0xff12470a969Dd362EB6595FFB44C82c959Fe9ACc"
]

const decimals = [
    6, // USDC.e
    6, // USDT
    18,
    18,
    18,
    18
]

const getClosureValueAbi = 'function getClosureValue(uint16 closureId) view returns (uint8 n, uint256 targetX128, uint256[16] balances, uint256 valueStaked, uint256 bgtValueStaked)';

// Helper to normalize balances to 18 decimals
function toReal(amount, decimals) {
    return amount / 10n ** BigInt(18 - decimals);
}

module.exports = {
    methodology: "Sum of all tokens in the closure",
    start: 6660733,
    berachain: {
        tvl: async (api) => {
            const numTokens = tokens.length;
            const closureIds = [];
            for (let i = 3; i < (1 << numTokens); i++) {
                closureIds.push(i);
            }

            const closureValues = await api.multiCall({
                abi: getClosureValueAbi,
                calls: closureIds.map(id => ({ target: BERACHAIN, params: [id] })),
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
                const balance = toReal(tokenBalances[i], decimals[i]);
                api.add(tokens[i], balance.toString());
            }
        },
    }
}
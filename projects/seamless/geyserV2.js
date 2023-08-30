const sdk = require("@defillama/sdk");

// Unbuttoned AAVE AMPL (ubAAMPL)
// AMPL Geyser
const UNBUTTON_TOKEN_ADDRESS = "0xF03387d8d0FF326ab586A58E0ab4121d106147DF";
const GEYSER_ADDRESS = "0x5Ec6f02D0b657E4a56d6020Bc21F19f2Ca13EcA9";

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const underlyingBalance = await api.call({
    abi: "function balanceOfUnderlying(address owner) external view override returns (uint256)",
    target: UNBUTTON_TOKEN_ADDRESS,
    params: [GEYSER_ADDRESS],
  });

  sdk.util.sumSingleBalance(
    balances,
    UNBUTTON_TOKEN_ADDRESS,
    underlyingBalance,
    api.chain
  );

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  ethereum: {
    tvl,
  },
};

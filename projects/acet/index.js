const stakingAccounts = [
    "0x64D2C3a33F5bc09Dc045f9A20fA4cA4f42215c0b",
    "0xfb62ea552eeba8b00cc5db56ba8d7c50429c0001",
    "0x38506a479E8959150466cE9253c19089fd0907D7",
];
  
const token = "0x9F3BCBE48E8b754F331Dfc694A894e8E686aC31D";
  
module.exports = {
    bsc: {
        tvl: async () => ({}),
        staking: async (api) => {
            return api.sumTokens({
                tokensAndOwners: stakingAccounts.map((account) => [token, account]),
        });
      },
    },
};
  
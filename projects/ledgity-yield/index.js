module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "TVL is calculated by taking the sum of all USDC deposited in LUSDC pools cross-chains.",
};

const lusdcAddresses = {
  arbitrum: "0xd54d564606611A3502FE8909bBD3075dbeb77813",
  linea: "0x4af215dbe27fc030f37f73109b85f421fab45b7a",
};

for (const [chain, lusdcAddress] of Object.entries(lusdcAddresses)) {
  module.exports[chain] = {
    tvl: async (_, _1, _2, { api }) => {
      // Retrieve USDC supply on the current chain
      let tvl = await api.call({
        abi: "erc20:totalSupply",
        target: lusdcAddress,
        chain: chain,
      });

      // Convert fixed-point number to float
      tvl = tvl / 1e6;

      // Return the USDC TVL
      return { "usd-coin": tvl };
    },
  };
}

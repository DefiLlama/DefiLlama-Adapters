const sdk = require("@defillama/sdk");

module.exports = {
  methodology: "Tracks EURT tokens locked in Europa Tech smart contracts on Base (P2PEscrow, YieldVault, Lending)",
  base: {
    tvl: async (api) => {
      const EURT = "0xF0ff21C0a3De78a4503A77340079f3d4dad3d373";
      const holders = [
        "0xb629238600BE56Dc9d05f224DA4AEe1Dd44d0A7d", // P2PEscrow
        "0x63468cBe53E31c469412B8E2769284e87259e82b", // YieldVault
        "0x37E971EA14089C4B61EFCe17886F8Ed2b0430117", // Lending
      ];
      await api.sumTokens({ owners: holders, tokens: [EURT] });
    }
  }
};

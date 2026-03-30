const sdk = require("@defillama/sdk");

const EURT = "0xF0ff21C0a3De78a4503A77340079f3d4dad3d373";
const EUROPA_SHARE_TOKEN = "0x0f3cEe146B7D2F6795E60B33AE6e339A64d77Fc6";

// Share prices in EURT (whole numbers, EUR-pegged, 18 decimals)
// tokenId 0 = Hotel Baistrocchi (65 EURT/share)
// tokenId 1 = Albergo Europa    (75 EURT/share)
const SHARE_PRICES_EURT = [65n, 75n];
const EURT_DECIMALS = 10n ** 18n;

const totalSupplyPerTokenAbi = "function totalSupplyPerToken(uint256) view returns (uint256)";

module.exports = {
  methodology:
    "Tracks EURT stablecoins locked in Europa Tech smart contracts (P2PEscrow, YieldVault, Lending) plus tokenized real estate value: EuropaShareToken totalSupply × sharePrice for each property.",
  base: {
    tvl: async (api) => {
      // 1. Track EURT held in protocol contracts
      const holders = [
        "0xb629238600BE56Dc9d05f224DA4AEe1Dd44d0A7d", // P2PEscrow
        "0x63468cBe53E31c469412B8E2769284e87259e82b", // YieldVault
        "0x37E971EA14089C4B61EFCe17886F8Ed2b0430117", // Lending
      ];
      await api.sumTokens({ owners: holders, tokens: [EURT] });

      // 2. Track tokenized real estate value via EuropaShareToken
      // totalSupplyPerToken(tokenId) returns the number of minted shares (whole units)
      const supplies = await api.multiCall({
        calls: SHARE_PRICES_EURT.map((_, i) => ({
          target: EUROPA_SHARE_TOKEN,
          params: [i],
        })),
        abi: totalSupplyPerTokenAbi,
      });

      // Add each property's TVL: shares × priceInEurt × 10^18
      supplies.forEach((supply, i) => {
        const valueInWei =
          BigInt(supply) * SHARE_PRICES_EURT[i] * EURT_DECIMALS;
        api.add(EURT, valueInWei.toString());
      });
    },
  },
};

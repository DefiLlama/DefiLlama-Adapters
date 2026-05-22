const { cexExports } = require("../helper/cex");

const config = {
  ethereum: {
    owners: [
      "0x95B564F3B3BaE3f206aa418667bA000AFAFAcc8a",
      "0x079A892628EBf28d0Ed8f00151cff225A093dc63",
      "0xedC6BacdC1e29D7c5FA6f6ECA6FDD447B9C487c9",
      "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
    ],
  },
  solana: {
    owners: [
      "5BCgqYg51CANe8qUMPYWJsqRA4Y8HnyfmvkoJxcEmQfY",
      "2h8JJq1kAsJvKYVrsEqwhQTcy99p465esHUFcJA94QY2"
    ],
  },
  bitcoin: {
    owners: [
      "bc1qfpeps3wcmzk422hvm5jeq5lelnqlzznjwyfy69",
      "37biYvTEcBVMoR1NGkPTGvHUuLTrzcLpiv",
      "bc1qrd7t2sl5rdfke32qcryyep6r78vyq703mvggq7"
    ],
  },
  bsc: {
    owners: [
      "0x079A892628EBf28d0Ed8f00151cff225A093dc63",
    ],
  },
  base: {
    owners: [
      "0x079A892628EBf28d0Ed8f00151cff225A093dc63",
      "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
    ],
  },
  optimism: {
    owners: [
      "0x079A892628EBf28d0Ed8f00151cff225A093dc63",
      "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
    ],
  },
  hyperliquid: {
    owners: [
      "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
    ],
  },
  plasma: {
    owners: [
      "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
    ],
  },
   arbitrum: {
    owners: [
      "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
    ],
  },
    linea: {
    owners: [
      "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
    ],
  },
    sonic: {
    owners: [
      "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
    ],
  },
      era: {
    owners: [
      "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
    ],
  },
};

module.exports = cexExports(config);
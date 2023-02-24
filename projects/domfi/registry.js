
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const Chain = {
  ETHEREUM: 'ethereum',
  POLYGON: 'polygon',
  BOBA: 'boba',
}

const usdc = {
  [Chain.ETHEREUM]: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  [Chain.POLYGON]: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  [Chain.BOBA]: "0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc",
}

const lsps = {
  [Chain.ETHEREUM]: [
    // BTCDOM
    {
      address: "0x3e75DCadDf32571d082da914c471180636f9567d",
    },

    // ETHDOM
    {
      address: "0x94E653AF059550657e839a5DFCCA5a17fD17EFdf",
    },

    // USDTDOM
    {
      address: "0xD3a0e00f11A91DA9797eEf5B74dF8fc325FC50e0",
    }
  ],

  [Chain.POLYGON]: [
    // BTCDOM
    {
      address: "0x12CcE472430f7F5071375Cc0A1Aab717310bE116",
    },

    // ETHDOM
    {
      address: "0x2771322091C9f86F1f770E2A633C66c068644100",
    },

    // USDTDOM
    {
      address: "0x514b3C2761Edc2487F320392EDF094d65E20C9Ee",
    },
  ],
  
  [Chain.BOBA]: [
    // BTCDOM-JUN20
    { address: "0x3C77d0130Eb6AfF1DED8C72fb7a5F383B7961c03" },
    // ETHDOM-JUN20
    { address: "0xCAB14a130cDB3143aD81657D552a7Cee1917a18e" },
    // USDTDOM-JUN20
    { address: "0x5B9f3B4648b1C7573d9c2A068020Bb34AEC67589" },

    // BTCDOM-JUN40
    { address: "0x156a4595b87cc204dc96d05f366ac3fcdff30bec" },
    // ETHDOM-JUN40
    { address: "0xF123b661d80e755ec26BC0C0CCaAFDD258a102d6" },
    // USDTDOM-JUN40
    { address: "0x6cafFBf5697c8744713956fdAf84d6a0613Ce20f" },
  ]
}

const uniswapFactory = {
  ethereum: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  polygon: "0x5757371414417b8c6caad45baef941abc7d3ab32",
  boba: "0x7DDaF116889D655D1c486bEB95017a8211265d29",
}

module.exports = {
  Chain,
  ZERO_ADDRESS,
  lsps,
  uniswapFactory,
  usdc,
};

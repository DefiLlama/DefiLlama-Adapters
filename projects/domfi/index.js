const lsps = {
  ethereum: [
    // BTCDOM
    "0x3e75DCadDf32571d082da914c471180636f9567d",
    // ETHDOM
    "0x94E653AF059550657e839a5DFCCA5a17fD17EFdf",
    // USDTDOM
    "0xD3a0e00f11A91DA9797eEf5B74dF8fc325FC50e0",],

  polygon: [
    // BTCDOM
    "0x12CcE472430f7F5071375Cc0A1Aab717310bE116",
    // ETHDOM
    "0x2771322091C9f86F1f770E2A633C66c068644100",
    // USDTDOM
    "0x514b3C2761Edc2487F320392EDF094d65E20C9Ee",],

  boba: [
    // BTCDOM-JUN20
    "0x3C77d0130Eb6AfF1DED8C72fb7a5F383B7961c03",
    // ETHDOM-JUN20
    "0xCAB14a130cDB3143aD81657D552a7Cee1917a18e",
    // USDTDOM-JUN20
    "0x5B9f3B4648b1C7573d9c2A068020Bb34AEC67589",

    // BTCDOM-JUN40
    "0x156a4595b87cc204dc96d05f366ac3fcdff30bec",
    // ETHDOM-JUN40
    "0xF123b661d80e755ec26BC0C0CCaAFDD258a102d6",
    // USDTDOM-JUN40
    "0x6cafFBf5697c8744713956fdAf84d6a0613Ce20f",
  ]
}

async function tvl(api) {
  const lsp = lsps[api.chain]
  const tokens = await api.multiCall({ abi: "address:collateralToken", calls: lsp })
  await api.sumTokens({ tokensAndOwners2: [tokens, lsp], })

}

module.exports = {
  ethereum: { tvl, },
  polygon: { tvl, },
  boba: { tvl, },
};

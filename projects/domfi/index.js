const ADDRESSES = require('../helper/coreAssets.json');

const CONFIG = {
  base: { 
    owners: [
      "0xA194082Aabb75Dd1Ca9Dc1BA573A5528BeB8c2Fb", // DomFi USDC LP (Vault)
      "0xcCd5891083A8acD2074690F65d3024E7D13d66E7", // DomfiTradingStorage (Collateral)
    ], 
    tokens: [ADDRESSES.base.USDC] },
  ethereum: {
    lsps: [
    "0x3e75DCadDf32571d082da914c471180636f9567d",
    "0x94E653AF059550657e839a5DFCCA5a17fD17EFdf",
    "0xD3a0e00f11A91DA9797eEf5B74dF8fc325FC50e0"
  ]},
  polygon: { 
    lsps: [
    "0x12CcE472430f7F5071375Cc0A1Aab717310bE116",
    "0x2771322091C9f86F1f770E2A633C66c068644100",
    "0x514b3C2761Edc2487F320392EDF094d65E20C9Ee"
  ]},
  boba: {
    lsps: [
    "0x3C77d0130Eb6AfF1DED8C72fb7a5F383B7961c03",
    "0xCAB14a130cDB3143aD81657D552a7Cee1917a18e",
    "0x5B9f3B4648b1C7573d9c2A068020Bb34AEC67589",
    "0x156a4595b87cc204dc96d05f366ac3fcdff30bec",
    "0xF123b661d80e755ec26BC0C0CCaAFDD258a102d6",
    "0x6cafFBf5697c8744713956fdAf84d6a0613Ce20f"
  ]}
}

const tvl = async (api) => {
  const chain = api.chain
  const { owners, tokens, lsps } = CONFIG[chain]
  if (chain === "base") return api.sumTokens({ owners, tokens })
  const collateralsTokens = await api.multiCall({ abi: "address:collateralToken", calls: lsps })
  await api.sumTokens({ tokensAndOwners2: [collateralsTokens, lsps] })
}

Object.keys(CONFIG).forEach(chain => module.exports[chain] = { tvl })
const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury_vault = "0xD0A7A8B98957b9CD3cFB9c0425AbE44551158e9e";
const treasury_ops = "0x042B32Ac6b453485e357938bdC38e0340d4b9276";
const treasury_voter = "0xA9ed98B5Fb8428d68664f3C5027c62A10d45826b";
const treasury_dev = "0xB65cef03b9B89f99517643226d76e286ee999e77";
const treasury_tech = "0x86cbD0ce0c087b482782c181dA8d191De18C8275";
const treasury_pay = "0x30a9c1D258F6c2D23005e6450E72bDD42C541105";
const treasury_drip1 = "0xA3Dc099D14722D0e25B3A904427377B4B2ab9fA4";
const treasury_drip2 = "0xC0D8fD5c722AF68437E7dFc095a980500dC0961D";
const treasury_bfraxbp = "0xe0705A91984b076C250d410A41f615380aF1C2ed";
const BADGER = "0x3472A5A71965499acd81997a54BBA8D852C6E53d";
const DIGG = "0x798D1bE841a82a273720CE31c822C61a67a601C3";
const treasuryarb = "0xb364bab258ad35dd83c7dd4e8ac78676b7aa1e9f"

const mapping = {
  '0x4efc8ded860bc472fa8d938dc3fd4946bc1a0a18': '0xb460daa847c45f1c4a41cb05bfb3b51c92e41b36',
  '0xd7c9c6922db15f47ef3131f2830d8e87f7637210': '0x8eb6c82c3081bbbd45dcac5afa631aac53478b7c',
  '0xaad4ee162dbc9c25cca26ba4340b36e3ef7c1a80': '0x1ee442b5326009bb18f2f472d3e0061513d1a0ff',
}

Object.entries(mapping).forEach(([key, val]) => mapping[key.toLowerCase()] = val)

const transformAddress = i => {
  i = i.toLowerCase()
  i = mapping[i] ?? i
  return 'ethereum:' + i
}

module.exports = treasuryExports({
  ethereum: {
    tokens: [
        nullAddress,
        ADDRESSES.ethereum.WBTC,//WBTC
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.USDT,//USDT
        ADDRESSES.ethereum.LUSD,//LUSD
        "0x9ff58f4fFB29fA2266Ab25e75e2A8b3503311656",//aWBTC
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.RETH,//rETH
        "0x25f0b7c3A7A43b409634a5759526560cC3313d75", // cvxBADGERFRAX-f
        "0xaad4ee162dbc9c25cca26ba4340b36e3ef7c1a80", // aura50rETH-50BADGER-vault
        "0x4efc8ded860bc472fa8d938dc3fd4946bc1a0a18", // aura20WBTC-80BADGER-vault
        "0xd7c9c6922db15f47ef3131f2830d8e87f7637210", // aura40WBTC-40DIGG-20graviAURA-vault
     ],
    owners: [treasury_vault, treasury_ops, treasury_voter, treasury_dev, treasury_tech, treasury_pay, treasury_drip1, treasury_drip2, treasury_bfraxbp],
    ownTokens: [BADGER, DIGG],
    resolveUniV3: true,
    transformAddress,
  },
  arbitrum: {
    tokens: [
      nullAddress,
      "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978"
    ],
    owners: [treasuryarb]
  }
})

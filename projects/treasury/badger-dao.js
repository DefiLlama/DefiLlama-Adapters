const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury_vault = "0xD0A7A8B98957b9CD3cFB9c0425AbE44551158e9e";
const treasury_ops = "0x042B32Ac6b453485e357938bdC38e0340d4b9276";
const treasury_voter = "0xA9ed98B5Fb8428d68664f3C5027c62A10d45826b";
const treasury_dev = "0xB65cef03b9B89f99517643226d76e286ee999e77";
const treasury_tech = "0x86cbD0ce0c087b482782c181dA8d191De18C8275";
const treasury_pay = "0x30a9c1D258F6c2D23005e6450E72bDD42C541105";
const treasury_drip1 = "0xA3Dc099D14722D0e25B3A904427377B4B2ab9fA4";
const treasury_drip2 = "0xC0D8fD5c722AF68437E7dFc095a980500dC0961D";
const BADGER = "0x3472A5A71965499acd81997a54BBA8D852C6E53d";
const DIGG = "0x798D1bE841a82a273720CE31c822C61a67a601C3";

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
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",//WBTC
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",//DAI
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",//USDC
        "0xdAC17F958D2ee523a2206206994597C13D831ec7",//USDT
        "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",//LUSD
        "0x9ff58f4fFB29fA2266Ab25e75e2A8b3503311656",//aWBTC
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",//WETH
        "0xae78736Cd615f374D3085123A210448E74Fc6393",//rETH
        "0x09b2e090531228d1b8e3d948c73b990cb6e60720", // BADGERFRAX-f
        "0xaad4ee162dbc9c25cca26ba4340b36e3ef7c1a80", // aura50rETH-50BADGER-vault
        "0x4efc8ded860bc472fa8d938dc3fd4946bc1a0a18", // aura20WBTC-80BADGER-vault
        "0xd7c9c6922db15f47ef3131f2830d8e87f7637210", // aura40WBTC-40DIGG-20graviAURA-vault
     ],
    owners: [treasury_vault, treasury_ops, treasury_voter, treasury_dev, treasury_tech, treasury_pay, treasury_drip1, treasury_drip2],
    ownTokens: [BADGER, DIGG],
    resolveUniV3: true,
    transformAddress,
  },
})

const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { stakingUnknownPricedLP } = require("../helper/staking");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x6abdda34fb225be4610a2d153845e09429523cd2) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  evmos: {
    tvl: calculateUsdUniTvl(
      "0x6abdda34fb225be4610a2d153845e09429523cd2",
      "evmos",
      "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517", //WEVMOS
      [
        "0x63743ACF2c7cfee65A5E356A4C4A005b586fC7AA", //madDAI
        "0x5842C5532b61aCF3227679a8b1BD0242a41752f2", //madWETH
        "0xF80699Dc594e00aE7bA200c7533a07C1604A106D", //madWBTC
        "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82", //madUSDC
        "0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e", //madUSDT
        "0x3f75ceabCDfed1aCa03257Dc6Bdc0408E2b4b026", //DIFF
        "0xFA3C22C069B9556A4B2f7EcE1Ee3B467909f4864", //OSMO
        "0xC5e00D3b04563950941f7137B5AfA3a534F0D6d6", //ATOM
        "0x28eC4B29657959F4A5052B41079fe32919Ec3Bd3", //madFRAX
        "0xd0ec216A38F199B0229AE668a96c3Cd9F9f118A6", //madFXS
        "0xE03494D0033687543a80c9B1ca7D6237F2EA8BD8", //FRAX
        "0xd8176865DD0D672c6Ab4A427572f80A72b4B4A9C", //FXS
        "0x461d52769884ca6235B685EF2040F47d30C94EB5", //mulDAI
        "0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D", //mulWETH
        "0x332730a4F6E03D9C55829435f10360E13cfA41Ff", //mulWBTC
        "0x2C78f1b70Ccf63CDEe49F9233e9fAa99D43AA07e", //mulUSDC
        "0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4", //mulUSDT
        "0x940dAAbA3F713abFabD79CdD991466fe698CBe54", //ceDAI
        "0x153A59d48AcEAbedbDCf7a13F67Ae52b434B810B", //ceWETH
        "0xb98e169C37ce30Dd47Fdad1f9726Fb832191e60b", //ceWBTC
        "0xe46910336479F254723710D57e7b683F3315b22B", //ceUSDC
        "0xb72A7567847abA28A2819B855D7fE679D4f59846", //ceUSDT
        "0x516e6D96896Aea92cE5e78B0348FD997F13802ad", //ceBUSD
        "0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4", //ceBNB
        "0x8006320739fC281da67Ee62eB9b4Ef8ADD5C903a", //ceAVAX
        "0x729416B1F442f204989f1C9f0d58321F878808eD", //ceFTM
        "0x48421FF1c6B93988138130865C4B7Cce10358271", //ceAURORA
        "0xFe6998C5c22936CCa749b14Fcf5F190398cfa8F8", //CELR
      ],
      "evmos"
    ),
    staking: stakingUnknownPricedLP('0x75aeE82a16BD1fB98b11879af93AB7CE055f66Da', '0x3f75ceabcdfed1aca03257dc6bdc0408e2b4b026', "evmos", "0x5b575e84e4921A93D57301cB75C9635BA12D50e2")
  },
}; // node test.js projects/diffusionfi/index.js
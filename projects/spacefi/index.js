const { getUniTVL } = require('../helper/unknownTokens')
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const sdk = require('@defillama/sdk');
const axios = require("axios");
const {toUSDTBalances} = require('../helper/balances')

//tvl
async function NFTTvl() {
  const url = `https://apiv2.spacefi.io/?method=data.nft.getnfttvl`;
  let nftTotal = (await axios.get(url)).data.tvl.nftTotal;
  return toUSDTBalances(nftTotal);

}



const swapTVL = calculateUsdUniTvl(
    "0x868A71EbfC46B86a676768C7b7aD65055CC293eE",
    "evmos",
    "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517", //WEVMOS
    [
      "0x63743ACF2c7cfee65A5E356A4C4A005b586fC7AA", //nomad-dai
      "0x5842C5532b61aCF3227679a8b1BD0242a41752f2", //nomad-weth
      "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82", //nomad-usdc
      "0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e", //nomad-usdt
      "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517", //wevmos
      "0x332730a4f6e03d9c55829435f10360e13cfa41ff", //mulWBTC
      "0x461d52769884ca6235b685ef2040f47d30c94eb5", //mulDAI
      "0xc1be9a4d5d45beeacae296a7bd5fadbfc14602c4", //mulUSDT
      "0x7c598c96d02398d89fbcb9d41eab3df0c16f227d", //mulETH
      "0x2c78f1b70ccf63cdee49f9233e9faa99d43aa07e", //mulUSDC
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
)

module.exports = {
  misrepresentedTokens: true,
  evmos: {
    tvl: sdk.util.sumChainTvls([swapTVL, NFTTvl]),
  },
};
// node test.js projects/spacefi/index.js
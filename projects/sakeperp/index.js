const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const ethSake = "0x066798d9ef0833ccc719076Dab77199eCbd178b0";
const ethSakebar = "0x5fe808a4889b714496E7b821c8542e26be2f8f67";
const bscSake = "0x8BD778B12b15416359A227F0533Ce2D91844e1eD";
const bscSakebar = "0xbC83FAdA7D0881F772daaB2B4295F949FA309B59";
const perpVault = "0xa34dA41edB2b15A20893d2208377E24D8dcdeB6e";

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL consists of pools in the factory contract and the BUSD in the PerpVault contract. Staking consists of SAKE in SakeBar.",
  ethereum: {
    tvl: getUniTVL({ factory: '0x75e48C954594d64ef9613AeEF97Ad85370F13807', useDefaultCoreAssets: true, }),
    staking: staking(ethSakebar, ethSake, ),
  },
  bsc: {
    tvl: sdk.util.sumChainTvls([getUniTVL({ factory: '0xA534cf041Dcd2C95B4220254A0dCb4B905307Fd8', useDefaultCoreAssets: true, }), staking(perpVault, ADDRESSES.bsc.BUSD,)]),
    staking: staking(bscSakebar, bscSake, ),
  },
};

const ADDRESSES = require('../helper/coreAssets.json')
const { getLiquityTvl } = require("../helper/liquity.js");
const { sumTokensExport } = require("../helper/unknownTokens.js");

// TroveManager holds total system collateral (deposited PLSX)
const TROVE_MANAGER_ADDRESS = "0x118b7CF595F6476a18538EAF4Fbecbf594338B39";
const PLSX_ADDRESS = ADDRESSES.pulse.PLSX;

// Staking holds LQTY tokens and receive share of protocol revenue
const STAKING_ADDRESS = "0xd92DF13b6cd9eA8fc116b1865D2d72Be41d74B1a";
const EARN_ADDRESS = "0xb513038BbFdF9D40B676F41606f4F61D4b02c4A2";

const PXDC_FARMING_ADDRESS = "0x5D8C8A7ECee559Db722626B0E537aBcc1261aEb2";
const LP_PXDC_PLSX_ADDRESS = "0xabb36512813194b12A82A319783dBB455652440A";

const EARN_FARMING_ADDRESS = "0x7655C30579564ec7d85aeda9eB36EE2B26FE6Cea";
const LP_EARN_PLSX_ADDRESS = "0xed77CbbB80e5a5C3A1FE664419d6F690766b5913";
const lps = [LP_PXDC_PLSX_ADDRESS, LP_EARN_PLSX_ADDRESS]

module.exports = {
    start: '2024-02-20',
    methodology: "Total Value Locked includes all Troves, Stability Pool, Staking Pool and LP Farming Pools",
    pulse: {
        tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS, { collateralToken: PLSX_ADDRESS }),
        staking: sumTokensExport({ owner: STAKING_ADDRESS, tokens: [EARN_ADDRESS], lps, useDefaultCoreAssets: true, }),
        pool2: sumTokensExport({ owners: [PXDC_FARMING_ADDRESS, EARN_FARMING_ADDRESS], tokens: lps, useDefaultCoreAssets: true, }),
    }
}
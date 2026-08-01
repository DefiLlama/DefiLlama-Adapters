const ADDRESSES = require('../helper/coreAssets.json')
const { getLiquityTvl } = require("../helper/liquity.js");
const { sumTokensExport } = require("../helper/unknownTokens.js");

// TroveManager holds total system collateral (deposited HEX)
const TROVE_MANAGER_ADDRESS = "0xC2D0720721d48cE85e20Dc9E01B8449D7eDd14CE";
const HEX_ADDRESS = ADDRESSES.pulse.HEX;

// Staking holds LQTY tokens and receive share of protocol revenue
const STAKING_ADDRESS = "0xCeC2c718ceFdb3A515D3CC22e430b46933922CE4";
const FLEX_ADDRESS = "0x9c6fA17D92898B684676993828143596894AA2A6";

const HEXDC_FARMING_ADDRESS = "0x63D134B47692d154C78053117D803e22cB1F7593";
const LP_HEXDC_HEX_ADDRESS = "0x9756F095DfA27D4c2EAE0937a7b8a6603D99Affb";

const FLEX_FARMING_ADDRESS = "0x74F8A9dFefe855Dc97a4A4962b7c6cEc074aED62";
const LP_FLEX_HEX_ADDRESS = "0x476d63aB94B4E86614Df0C3D5A27E9e22631D062";
const lps = [LP_HEXDC_HEX_ADDRESS, LP_FLEX_HEX_ADDRESS]

module.exports = {
    start: '2024-05-01',
    methodology: "Total Value Locked includes all Troves, Stability Pool, Staking Pool and LP Farming Pools",
    pulse: {
        tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS, { collateralToken: HEX_ADDRESS }),
        staking: sumTokensExport({ owner: STAKING_ADDRESS, tokens: [FLEX_ADDRESS], lps, useDefaultCoreAssets: true, }),
        pool2: sumTokensExport({ owners: [HEXDC_FARMING_ADDRESS, FLEX_FARMING_ADDRESS], tokens: lps, useDefaultCoreAssets: true, }),
    }
}
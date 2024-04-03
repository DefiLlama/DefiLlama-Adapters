const ADDRESSES = require('../helper/coreAssets.json')
const DW_TOKEN_CONTRACT = '0x43adc41cf63666ebb1938b11256f0ea3f16e6932';
const DOGE = '0xbA2aE424d960c26247Dd6c32edC70B295c744C43';
const SHIB = '0x2859e4544C4bB03966803b044A93563Bd2D0DD4D';
const FLOKI = '0xfb5B838b6cfEEdC2873aB27866079AC55363D37E';
const USDT = ADDRESSES.bsc.USDT;
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    bsc: {
        tvl: sumTokensExport({ 
          owner: DW_TOKEN_CONTRACT, 
          tokens: [DOGE, SHIB, FLOKI, USDT]
        }),
    }
};
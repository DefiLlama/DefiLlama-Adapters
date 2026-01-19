const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const { staking } = require('../helper/staking');

const KDAI_RHEA_LP = "0x0b8ac02bf51e1c3a809f8f773dd44025c31c4467";
const KDAI = ADDRESSES.klaytn.KDAI;
const TREASURY = "0x32F71263CF373d726f4e45286Bbb6935d553E8D0";
const RHEA = "0x0758fb651282581f86316514e8f5021493e9ed83";
const STAKING_ADDR = "0xee0f2e95e69d4246f8267be6d0f2610ce75d993c";

module.exports = {
  methodology: "Counts tokens on the treasury for tvl and staked RHEA for staking",
  misrepresentedTokens: true,
  klaytn: {
    tvl: sumTokensExport({ owner: TREASURY, tokens: [KDAI_RHEA_LP, KDAI], }),
    staking: staking(STAKING_ADDR, RHEA)
  }
};

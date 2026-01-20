const ADDRESSES = require('../helper/coreAssets.json');
const { staking } = require('../helper/staking');

const ExodStaking = "0x8b8d40f98a2f14e2dd972b3f2e2a2cc227d1e3be"
const exod = "0x3b57f3feaaf1e8254ec680275ee6e7727c7413c7"
const gohm = "0x91fa20244fb509e8289ca630e5db3e9166233fdc"
const mai = "0xfb98b335551a418cd0737375a2ea0ded62ea213b"
const treasury = "0x6a654d988eebcd9ffb48ecd5af9bd79e090d8347"
const dai = ADDRESSES.fantom.DAI
const wftm = ADDRESSES.fantom.WFTM


module.exports = {
  fantom: {
    tvl: staking(treasury, [mai, dai, wftm, gohm]),
    staking: staking(ExodStaking, exod)
  },
  methodology:
    "Counts tokens on the treasury for TVL and staked EXOD for staking",
};
const { getFactoryTvl } = require('./factoryTvl')

// Terraport DEX factory contract on Terra Classic
// Verify the actual factory address at: https://finder.terra.money or Terraport docs
const FACTORY_CONTRACT = 'terra1n75fgfc8clsssrm2k0fswgtzsvstdaah7la6sfu96szdu22xta0q57rqqr'

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity provided in Terraport DEX trading pairs on Terra Classic",
  terra: {
    tvl: getFactoryTvl(FACTORY_CONTRACT)
  }
}

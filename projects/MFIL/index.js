const MFILPOOLCONTRACT = '0x72A57760aE548B8d1B3a1b29bE25D2f09a6cB558';
const MFILREGULARPOOLCONTRACT = '0xDcECF046dd21A7298Eb3c0a3c70d716999E7A607'
const ADDRESSES = require('../helper/coreAssets.json')

async function mfilTvl(_, _1, _2, { api }) {
  const mfilPoolStakeMfil = await api.call({
    target: MFILPOOLCONTRACT,
    abi: "erc20:totalSupply",
  })

  api.add(ADDRESSES.null, mfilPoolStakeMfil)
}

module.exports = {
  filecoin: {
    tvl: mfilTvl
  }, 
}

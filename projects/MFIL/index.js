const MFILPOOLCONTRACT = '0x72A57760aE548B8d1B3a1b29bE25D2f09a6cB558';
const MFILREGULARPOOLCONTRACT = '0xDcECF046dd21A7298Eb3c0a3c70d716999E7A607';

async function mfilTvl(_, _1, _2, { api }) {
    console.log("api = ", api);

  const mfilPoolStakeMfil = await api.call({
    target: MFILPOOLCONTRACT,
    abi: "erc20:balanceOf",
    params: [MFILPOOLCONTRACT],
  })

  const mfilRegularPoolStakeMfil = await api.call({
    target: MFILPOOLCONTRACT,
    abi: "erc20:balanceOf",
    params: [MFILREGULARPOOLCONTRACT],
  })

  return {
    "filecoin:0x0000000000000000000000000000000000000000": mfilPoolStakeMfil*1 + mfilRegularPoolStakeMfil*1,
  }
}

module.exports = {
  doublecounted: true,

  filecoin: {
    tvl: mfilTvl
  }, 
}

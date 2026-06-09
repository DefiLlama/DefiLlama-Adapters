// stTAO is Tensorplex's liquid-staked TAO. The previous adapter added the
// stTAO token by its own address, but the coins API has no price for that
// contract, so the protocol rendered $0 despite real staked TAO. stTAO is
// TAO-denominated (9 decimals), so value the supply as native TAO instead.
const st_tao = "0xB60acD2057067DC9ed8c083f5aa227a244044fD6"

async function tvl(api) {
  const supply = await api.call({ abi: 'erc20:totalSupply', target: st_tao })
  api.addCGToken('bittensor', supply / 1e9)
}

module.exports = {
  methodology: "Counts TAO staked through Tensorplex, measured as the total supply of stTAO (liquid-staked TAO, 9 decimals) and valued as native TAO.",
  ethereum: {
    tvl,
  },
}

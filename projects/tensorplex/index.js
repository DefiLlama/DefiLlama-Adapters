const st_tao = "0xB60acD2057067DC9ed8c083f5aa227a244044fD6"

async function tvl(api) {
  const supply = await api.call({ abi: 'erc20:totalSupply', target: st_tao })
  api.add(st_tao, supply)
}

module.exports = {
  methodology: "TVL counts tokens staked by the protocol.",
  ethereum: {
    tvl,
  },
}

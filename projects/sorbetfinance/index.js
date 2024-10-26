const abi = {
  "getPools": "function getPools(address deployer) view returns (address[])",
  "getUnderlyingBalances": "function getUnderlyingBalances() view returns (uint256 amount0Current, uint256 amount1Current)"
}

const config = {
  ethereum: '0xEA1aFf9dbFfD1580F6b81A3ad3589E66652dB7D9',
  optimism: '0x2845c6929d621e32B7596520C8a1E5a37e616F09',
  polygon: '0x37265A834e95D11c36527451c7844eF346dC342a'
}

module.exports = {
  doublecounted: true,
  methodology:
    "Counts TVL that's on all the Pools through G-UNI Factory Contract",
  hallmarks:[
      [1632253540, "GUNI-DAIUSDC Added to Maker"],
      [1643056020, "Maker GUNI Cap to 500M"],
  ],
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
     const G_UNI_Factory = config[chain]
     const deployers = await api.call({  abi: "address[]:getDeployers", target: G_UNI_Factory})
     const pools = (await api.multiCall({  abi: abi.getPools, calls: deployers, target: G_UNI_Factory})).flat()
     const token0s = await api.multiCall({  abi: "address:token0", calls: pools })
     const token1s = await api.multiCall({  abi: "address:token1", calls: pools })
     const bals = await api.multiCall({  abi: abi.getUnderlyingBalances, calls: pools })
     bals.forEach((bal, i) => {
      api.add(token0s[i], bal.amount0Current)
      api.add(token1s[i], bal.amount1Current)
     })
    }
  }
})
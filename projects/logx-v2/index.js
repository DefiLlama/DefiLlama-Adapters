const { staking } = require('../helper/staking')

module.exports = {
  methodology: "Tokens locked in HypCollateral contracts on different chains.",
}

const config = {
  base: ['0xaca5146bc74230e77DAB543d3a14F26c8c63939e',],
  arbitrum: ['0x4882520D47491561F51ea96aBC0397776Efc6cFd', '0x1d9B044393804CCFa2da3127470C9F65D4E0E5E6',],
  mantle: ['0x4417613C0fe034f7D333BF8a6247EaAAF1d51965', '0x650e8941E4d90b70576fDF1b05dbDc962DA2cab8',],
  mode: ['0x4882520D47491561F51ea96aBC0397776Efc6cFd','0x8BF17893f08C570fBA78E9268d3aFc61f42557f1'],
  bob: ['0xaca5146bc74230e77DAB543d3a14F26c8c63939e','0x1e7c3B771b27A29116E4Df5a2DCC54FDaAC902db'],
  sei: ['0xc010f83ae18dC5f40e888898F6605F075686432e','0x0B3b4FAFDe8baFde82C3BfD38538B7aEe4407498'],
  scroll: ['0x1C70cc9F8236C4Ae2ce3d34d4Da4696Aea611f90','0xcfFe53CEd05A750Fa58304c11997a0335dE731b6'],
  kroma: ['0xaca5146bc74230e77DAB543d3a14F26c8c63939e','0x1e7c3B771b27A29116E4Df5a2DCC54FDaAC902db'],
  taiko: ['0x650e8941E4d90b70576fDF1b05dbDc962DA2cab8','0x1d9B044393804CCFa2da3127470C9F65D4E0E5E6'],
  optimism: ['0x650e8941E4d90b70576fDF1b05dbDc962DA2cab8','0x4417613C0fe034f7D333BF8a6247EaAAF1d51965'],
  linea: ['0xaca5146bc74230e77DAB543d3a14F26c8c63939e','0x1e7c3B771b27A29116E4Df5a2DCC54FDaAC902db'],
  rari: ['0x1C70cc9F8236C4Ae2ce3d34d4Da4696Aea611f90',],
  mint: ['0xaca5146bc74230e77DAB543d3a14F26c8c63939e', '0xdB29A58A53Ac438a5E325f1d7a41346aA63b7ece',],
  polygon: ['0x1e7c3B771b27A29116E4Df5a2DCC54FDaAC902db', '0xaca5146bc74230e77DAB543d3a14F26c8c63939e',],
  abstract: ['0x816B55fF6E204d5825cf2792955daF449E819494',],
  apechain: ['0x4Ae1be658c57e5785e6D9a72d3e2214678fD80F2',],
  sonic: ['0x4Ae1be658c57e5785e6D9a72d3e2214678fD80F2', '0xaaA97fe165526dC29Cca977eCeA4CFcfe4FE64Cc',],
}

Object.keys(config).forEach(chain => {
  let vault = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (!Array.isArray(vault)) vault = [vault]
      const tokens = await api.multiCall({ abi: 'address:wrappedToken', calls: vault })
      return api.sumTokens({ tokensAndOwners2: [tokens, vault] })
    }
  }
})

module.exports.arbitrum.staking = staking('0x89E86f7d2398e8C1070d321D18c1Ce75aBF09b75', '0x59062301Fb510F4ea2417B67404CB16D31E604BA')
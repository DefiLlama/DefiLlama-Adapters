const { uniTvlExports } = require('../helper/unknownTokens')

const tvlExports = uniTvlExports({'metis': '0x633a093C9e94f64500FC8fCBB48e90dd52F6668F'}, { hasStablePools: true, })

module.exports = {
  metis: {
    ...tvlExports.metis,
    staking: () => ({})
  },
  hallmarks: [
    ['2022-10-19', "Metis Grant"],
    ['2024-08-14', "V1 set to withdraw-only"],
    ['2024-08-20', "V2 Launch"],
  ]
}
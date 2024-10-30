const { uniTvlExport } = require('../helper/unknownTokens')
const { mergeExports } = require('../helper/utils')
const { gmxExports } = require('../helper/gmx')
const exports1 = uniTvlExport('iotex', '0x92bfa051bf12a0aef9a5e1ac8b2aa7dc1b05a406', { hasStablePools: true, })
const exports2 = uniTvlExport('iotex', '0x9442E8d017bb3dC2Ba35d75204211e60f86fF0F8', { hasStablePools: true, })
const perp = gmxExports({ vault: '0x22e239513f03C5cc890DAad846Bb279C4837d242' })
const perpTvl = {
    iotex: {
        tvl: perp,
    }
}
module.exports = mergeExports(exports1, exports2, perpTvl)
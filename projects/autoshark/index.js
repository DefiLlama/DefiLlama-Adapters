
const finsFactory = "0xe759Dd4B9f99392Be64f1050a6A8018f73B53a13";

const jaws = "0xdd97ab35e3c0820215bc85a395e13671d84ccba2";
const jawsPool = "0x5D2112Ba0969EC66012380C1fb88F2A3D182Eb90";

const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'bsc': finsFactory
}, {staking: { bsc: [jawsPool, jaws] }})


const kRONOSMasterChef = "0x30e9f20414515116598D073F3EBA116c68A6f4aC";
const kronosDaoToken = "0xbeC68a941feCC79E57762e258fd1490F29235D75";

const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'bsc': '0xcc045ebC2664Daf316aa0652E72237609EA6CB4f'
}, { staking: { bsc: [kRONOSMasterChef, kronosDaoToken, ] }, })
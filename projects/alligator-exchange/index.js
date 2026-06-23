const token = "0x43C812Ba28cb061b1Be7514145A15C9E18a27342";
const stakingContract = "0x32A948F018870548bEd7e888Cd97a257b700D4c6";
const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'avax': '0xD9362AA8E0405C93299C573036E7FB4ec3bE1240'
}, { staking: { avax: [stakingContract, token] } })

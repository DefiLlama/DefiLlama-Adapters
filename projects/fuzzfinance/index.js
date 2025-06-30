const fuzz = "0x984b969a8e82f5ce1121ceb03f96ff5bb3f71fee";
const masterchef = "0x847b46ed6c3df75e34a0496ef148b89bf5eb41b1";

const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'harmony': '0x5245d2136dc79Df222f00695C0c29d0c4d0E98A6'
}, { staking: { harmony: [masterchef, fuzz, ] }, })
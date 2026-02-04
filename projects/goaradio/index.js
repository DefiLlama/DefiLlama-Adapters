const { staking } = require('../helper/staking')
const GOA_TOKEN = "0x625655d74289dc0C9fD3e16E762c93a9e6c106e4";

const LISTEN2EARN_CONTRACT = "0xA82e46a0Dd81217609FBe507De7213b93Aa5aa0e";
const VIEW2EARN_CONTRACT = "0x496Bb0D6440012E0a2eDa1BAbeBdd7310aeb1a54";


module.exports = {
  methodology: "TVL counts GOA tokens locked in Listen2Earn and View2Earn contracts on Goaradio chain.",
  start: 1735728000,
  saga: { 
    tvl: () => ({}),
    staking: staking([VIEW2EARN_CONTRACT, LISTEN2EARN_CONTRACT], GOA_TOKEN),
  },
};

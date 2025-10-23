const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens');
const { getTridentTVL } = require('../helper/sushi-trident')
const sdk = require('@defillama/sdk')

const PUMP_FACTORY = '0x26B42c208D8a9d8737A2E5c9C57F4481484d4616';
const PUMP_V3 = '0xE749c1cA2EA4f930d1283ad780AdE28625037CeD';
const SHELL_MASTERCHEF = '0x40a58fc672F7878F068bD8ED234a47458Ec33879';

const tokens = {
  "WAVAX": "0xAB4fBa02a2905a03adA8BD3d493FB289Dcf84024",
  "SHELL": "0xaD4CB79293322c07973ee83Aed5DF66A53214dc6",
  "bUSDT": "0x3C594084dC7AB1864AC69DFd01AB77E8f65B83B7",
  "sBWPM": "0x6c960648d5F16f9e12895C28655cc6Dd73B660f7",
  "KRILL": "0x4ED0A710a825B9FcD59384335836b18C75A34270",
  "PEARL": "0x08c4b51e6Ca9Eb89C255F0a5ab8aFD721420e447",
  "CLAM": "0x1ea53822f9B2a860A7d20C6D2560Fd07db7CFF85",
  "sADOL": "0x6214D13725d458890a8EF39ECB2578BdfCd82170"
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `counts the number of tokens in the PumpSpace contract. `,
  avax: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ factory: PUMP_FACTORY, useDefaultCoreAssets: true }), 
      getTridentTVL({ chain: 'avax', factory:PUMP_V3 }),
    ]),
    staking: staking([SHELL_MASTERCHEF], [tokens.SHELL]),
  },
};
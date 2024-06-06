const { staking } = require('../helper/staking');

const STATE_CHAIN_GATEWAY_CONTRACT = '0x826180541412D574cf1336d22c0C0a287822678A';
const FLIP_TOKEN = '0x6995ab7c4d7f4b03f467cf4c8e920427d9621dbd'

module.exports = {
            methodology: 'counts the number of FLIP tokens in the Chainflip State Chain Gateway Contract.',
    start: 1700740800, // FLIP went live on 2023-11-23 12:00 UTC
    ethereum: {
        tvl: () => 0,
        staking: staking(FLIP_TOKEN, STATE_CHAIN_GATEWAY_CONTRACT),
    }
};

const { staking } = require('../helper/staking');
const { nullAddress } = require('../helper/unwrapLPs');

const STATE_CHAIN_GATEWAY_CONTRACT = '0x826180541412D574cf1336d22c0C0a287822678A';
const FLIP_TOKEN = '0x6995ab7c4d7f4b03f467cf4c8e920427d9621dbd'

async function getTotalValueLocked(timestamp, block_height, _, { api }) {
    const stakedFlipInUSD = await api.call({
      abi: 'erc20:balanceOf',
      target: STATE_CHAIN_GATEWAY_CONTRACT,
      params: [FLIP_TOKEN],
    });

    api.add(STATE_CHAIN_GATEWAY_CONTRACT, stakedFlipInUSD)
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'counts the number of FLIP tokens in the Chainflip State Chain Gateway Contract.',
    start: 1700740800, // FLIP went live on 2023-11-23 12:00 UTC
    ethereum: {
        //tvl: getTotalValueLocked,
        tvl: () => 0,
        staking: staking(FLIP_TOKEN, STATE_CHAIN_GATEWAY_CONTRACT),
    }
};

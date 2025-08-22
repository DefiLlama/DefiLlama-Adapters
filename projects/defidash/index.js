
const sdk = require('@defillama/sdk');
const DEFI_DASH_CONTRACT = '0x59B88318d239da34188C42B9e76aAC6D50265974';
const DEFI_DASH_TOKEN = '0xd6df108d516a5dc83f39020a349085c79d4edf0d';

async function tvl(api) {
  // Get ETH balance using sdk
  const ethBalance = (await sdk.api.eth.getBalance({
    target: DEFI_DASH_CONTRACT,
    chain: api.chain,
    block: api.block,
  })).output;
  api.add('0x0000000000000000000000000000000000000000', ethBalance);

  // Get ERC20 token balance using standard ABI call
  const tokenBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: DEFI_DASH_TOKEN,
    params: [DEFI_DASH_CONTRACT],
  });
  api.add(DEFI_DASH_TOKEN, tokenBalance);
}

module.exports = {
  methodology: 'Counts the ETH and/or ERC20 tokens held in the DefiDash contract as TVL.',
  start: 33669807, // TODO: Replace with the actual block number when contract deployed on Base
  base: {
    tvl,
  },
  timetravel: true,
  misrepresentedTokens: false,
};

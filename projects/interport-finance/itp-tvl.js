const sdk = require("@defillama/sdk");
const abi = require('./itp-rev-share-abi.json');

async function itpEthereumTvl() {
  const balances = {};
  const itpRevShareAddress = '0x5DC6796Adc2420BD0f48e05f70f34B30F2AaD313';
  const itpTokenAddress = '0x2b1D36f5B61AdDAf7DA7ebbd11B35FD8cfb0DE31';

  const { output: tokens } = await sdk.api.abi.call({
    target: itpRevShareAddress,
    abi: abi.lockedSupply,
    chain: 'ethereum',
  });

  sdk.util.sumSingleBalance(balances, itpTokenAddress, tokens, 'ethereum');

  return balances;
}

module.exports = {
  itpEthereumTvl,
};

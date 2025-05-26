// adapters/zerobase/testing.js

// ABI fragment for getTVL(address) → uint256
const tvlAbi = {
  inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
  name: 'getTVL',
  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
};

async function testTwoTokens(api) {
  // 1. Configuration for this simple test
  const vault     = '0x9eF52D8953d184840F2c69096B7b3A7dA7093685';  // example vault
  const tokens    = [
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',           // USDT
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'            // USDC
  ];

  api.log(`\n🔍 [testTwoTokens] chain: ${api.chain}`);
  api.log(`   vault:  ${vault}`);
  api.log(`   tokens: ${tokens.join(', ')}`);

  // 2. Build calls array: one call per token
  const calls = tokens.map(token => ({
    target: vault,
    abi: tvlAbi,
    params: [token],
  }));

  try {
    // 3. Single-batch multicall for both tokens
    const response = await api.call({ chain: api.chain, calls });
    // response.output is an array of BigNumber-strings
    response.output.forEach((amount, i) => {
      api.log(`   → token[${i}] (${tokens[i]}) TVL = ${amount}`);
    });
  } catch (err) {
    api.log('🛑 Error in getTVL multicall:', err);
  }

  // 4. Return an empty object so runner stays happy
  return {};
}

module.exports = {
  methodology: 'Test: call getTVL for two tokens on one vault',
  ethereum: { tvl: testTwoTokens },
};

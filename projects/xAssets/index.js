const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');

// RWA Protocol Contract
const CONTRACT_ADDRESS = '0x10baa5c14ebde8681e83b2503682b3f45b8dc4c2';

// Define tokens to track
const TOKENS = {
  WXFI: {
    address: ADDRESSES.crossfi.WXFI,
    decimals: 18
  },
  WETH: {
    address: '0xa084d905e3F35C6B86B5E672C2e72b0472ddA1e3',
    decimals: 18
  },
  USDC: {
    address: '0x7bBcE15166bBc008EC1aDF9b3D6bbA0602FCE7Ba',
    decimals: 6
  },
  USDT: {
    address: '0x38E88b1ed92065eD20241A257ef3713A131C9155',
    decimals: 6
  },
  WBTC: {
    address: '0x417c85B9D0826501d7399FEeF417656774d333cc',
    decimals: 8
  }
};

async function tvl(timestamp, block, chainBlocks) {
  try {
    // Use sumTokens2 to get the balance of all tokens in the contract
    const balances = await sumTokens2({
      chain: 'crossfi',
      block: chainBlocks['crossfi'],
      owner: CONTRACT_ADDRESS,
      tokens: Object.values(TOKENS).map(token => token.address),
      resolveLP: false,
      failOnError: false, // Don't fail the entire adapter if one token fails
    });

    // Log token balances for debugging
    for (const [symbol, token] of Object.entries(TOKENS)) {
      const balance = balances[token.address] || 0;
      if (balance && balance !== '0') {
        console.log(`${symbol} balance:`, balance / (10 ** token.decimals));
      }
    }

    return balances;
  } catch (error) {
    console.error(`Error in xAssets TVL adapter: ${error.message}`);
    // Return empty balances in case of error to prevent breaking the entire adapter system
    return {};
  }
}

module.exports = {
  methodology: `Measures the total value locked (TVL) in the xAssets Real World Assets (RWA) protocol on CrossFi chain.
    TVL is calculated by summing the balances of:
    - WXFI (Wrapped XFI)
    - WETH (Wrapped ETH)
    - USDC
    - USDT
    - WBTC
    
    that are held by the main xAssets contract at ${CONTRACT_ADDRESS}.
    
    The protocol holds liquidity in multiple tokens to back real-world assets tokenized on the CrossFi chain.`,
  crossfi: {
    tvl,
  },
  timetravel: false, // Set to false if the RPC doesn't support block queries
  misrepresentedTokens: false,
};

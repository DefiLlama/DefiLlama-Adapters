const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');

const CONTRACT_ADDRESS = '0x10baa5c14ebde8681e83b2503682b3f45b8dc4c2';

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
    const balances = await sumTokens2({
        chain: 'crossfi',
        block: chainBlocks['crossfi'],
        owner: CONTRACT_ADDRESS,
        tokens: Object.values(TOKENS).map(token => token.address),
        resolveLP: false,
        failOnError: false,
    });

    return balances;
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
  timetravel: false,
  misrepresentedTokens: false,
};

const ADDRESSES = require( '../helper/coreAssets.json' )

const TD_CONTRACT = '0x469bbd88eEA8A2D9a5C6c82d9890Cf60962C27e6';

async function tvl(api) {
  const netAssets = await api.call({
    abi: 'uint256:netAsset',
    target: TD_CONTRACT
  } );
    
  const normalized = (BigInt(netAssets) / 1000000000000n).toString()

  api.add(ADDRESSES.base.USDC, normalized)
}

module.exports = {
  methodology: 'TVL is derived from netAsset (total assets under management), normalized to USDC.',
  start: 1773972900,
  base: {
    tvl,
  }
}; 
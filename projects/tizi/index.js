const ADDRESSES = require( '../helper/coreAssets.json' )

const TD_CONTRACT = '0x469bbd88eEA8A2D9a5C6c82d9890Cf60962C27e6';

async function tvl(api) {
  const [netAsset, tdDecimals, usdcDecimals] = await Promise.all([
    api.call({
      target: TD_CONTRACT,
      abi: 'uint256:netAsset',
    }),
    api.call({
      target: TD_CONTRACT,
      abi: 'erc20:decimals',
    }),
    api.call({
      target: ADDRESSES.base.USDC,
      abi: 'erc20:decimals',
    }),
  ])
    
  const diff = BigInt(tdDecimals) - BigInt(usdcDecimals)
  const normalized = (BigInt(netAsset) / (10n ** diff)).toString()

  api.add(ADDRESSES.base.USDC, normalized)
}

module.exports = {
  methodology: 'TVL is derived from netAsset (total assets under management), normalized to USDC.',
  start: 1773972900,
  base: {
    tvl,
  }
}; 
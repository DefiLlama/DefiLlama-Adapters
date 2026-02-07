const abi = {
    "balanceOf": "function balanceOf(address account) view returns (uint256)",
    "totalSupply": "function totalSupply() view returns (uint256)",
    "name": "function name() view returns (string)",
    "symbol": "function symbol() view returns (string)",
    "decimals": "function decimals() view returns (uint8)",
    "cap": "function cap() view returns (uint256)",
    "totalIssued": "function totalIssued() view returns (uint256)",
    "isPaused": "function isPaused() view returns (bool)",
    "latestAnswer": "function latestAnswer() view returns (int256)",
    "latestRoundData": "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
    "description": "function description() view returns (string)",
    "priceDecimals": "function decimals() view returns (uint8)"
  };
const { getTokenSupplies } = require('../helper/solana');
const { getResource } = require('../helper/chain/aptos');

// ACRED token addresses for different chains
// Pricing is handled by DefiLlama pricing infrastructure, not inside the adapter.
// This adapter intentionally returns raw token balances only.
const ACRED_ADDRESSES = {
  ethereum: { token: '0x17418038ecF73BA4026c4f428547BF099706F27B' },
  avax: { token: '0x7C64925002BFA705834B118a923E9911BeE32875' },
  polygon: { token: '0xFCe60bBc52a5705CeC5B445501FBAf3274Dc43D0' },
  aptos: { token: '0xe528f4df568eb9fff6398adc514bc9585fab397f478972bcbebf1e75dee40a88' },
  ink: { token: '0x53Ad50D3B6FCaCB8965d3A49cB722917C7DAE1F3' },
  solana: { token: 'FubtUcvhSCr3VPXEcxouoQjKQ7NWTCzXyECe76B7L3f8' },
  sei: { token: '0xf7fa6725183e603059fc23d95735bf67f72b2d78' },
};

async function tvl(api) {
  const { chain } = api;
  const chainAddresses = ACRED_ADDRESSES[chain];
  if (!chainAddresses) return api.getBalances();

  // Solana:
  // Supply may be zero if the mint is not indexed or has no discoverable supply.
  // This is expected behavior and values should not be inferred from other chains.
  if (chain === 'solana') {
    return getTokenSupplies([chainAddresses.token], { api });
  }

  // Aptos:
  // Fetch fungible asset supply via ConcurrentSupply resource.
  if (chain === 'aptos') {
    try {
      const resource = await getResource(
        chainAddresses.token,
        '0x1::fungible_asset::ConcurrentSupply',
        'aptos'
      );
      const totalSupply = resource?.current?.value;
      if (totalSupply != null) api.add(chainAddresses.token, totalSupply);
    } catch (e) {
      // Intentionally silent: do not emit zeros or fallback values
    }
    return api.getBalances();
  }

  // EVM chains (including Sei-compatible deployments):
  // Some chains may return zero if totalSupply is not exposed or is zero.
  const totalSupply = await api.call({
    abi: abi.totalSupply,
    target: chainAddresses.token,
  });

  api.add(chainAddresses.token, totalSupply);
  return api.getBalances();
}

module.exports = {
  methodology: 'TVL is calculated as the total supply of ACRED tokens on each supported chain.',
  ethereum: { tvl },
  avax: { tvl },
  polygon: { tvl },
  aptos: { tvl },
  ink: { tvl },
  solana: { tvl },
  sei: { tvl },
};

const ADDRESSES = require('../helper/coreAssets.json');

const BBHLP_VAULT_ROUTER_ADDRESS = "0x647a4D7F1F20Cf237C27b39fB6924f5a7691BB4b";

const HYPEREVM_TOKENS = [
  {
    symbol: "USDT0",
    address: ADDRESSES.hyperliquid.USDT0,
    decimals: 6,
  },
  {
    symbol: "USDE",
    address: ADDRESSES.hyperliquid.USDe,
    decimals: 18,
  },
  {
    symbol: "USDHL",
    address: '0xb50A96253aBDF803D85efcDce07Ad8becBc52BD5',
    decimals: 6,
  }
];

async function tvl(api) {
  try {
    const tvlValue = await api.call({
      abi: "function tvl() external view returns (uint256)",
      target: BBHLP_VAULT_ROUTER_ADDRESS,
    });
    
    const scaledTvl = BigInt(tvlValue) / BigInt(10 ** 12);
    api.add(HYPEREVM_TOKENS[0].address, scaledTvl.toString());
  } catch (error) {
    api.add(HYPEREVM_TOKENS[0].address, '0');
  }
}

module.exports = {
  methodology:
    "TVL is calculated from deposits in the vault and on Hyperliquid.",
  timetravel: false,
  hyperliquid: {
    tvl,
  },
  misrepresentedTokens: true,
};
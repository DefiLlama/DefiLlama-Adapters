const ADDRESSES = require("../helper/coreAssets.json");

const config = {
  kava:     { vault: "0x7BFf6c730dA681dF03364c955B165576186370Bc", token: ADDRESSES.kava.USDt },
  arbitrum: { vault: "0x439a923517C4DFD3F3d0ABb0C36E356D39CF3f9D", token: ADDRESSES.arbitrum.USDC_CIRCLE },
};

async function tvl(api) {
  const { vault, token } = config[api.chain];
  const value = await api.call({ abi: "uint256:totalVaultValue", target: vault });
  api.add(token, value);
}

module.exports = {
  methodology:
    "TVL is read from each DepositVault's totalVaultValue. Deposited stablecoins are deployed off-chain on CEX/DEX as part of a delta-neutral strategy, so the contract itself holds ~0 balance and the reported value reflects assets under management as recorded on-chain by the strategy role.",
  kava:     { tvl },
  arbitrum: { tvl },
};

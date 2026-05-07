// projects/credit-coop/index.js
const config = {
  ethereum: {
    vaults: [
      '0x6dACaF632017E2DFc929484606B0feb93088B623'
    ],
  },
  base: {
    vaults: [
      '0x0cf11AC4ea33b6d7274CD7d6e7cEA9f3F65FCf9D',
      '0x214699b0ad2e26ffef0247fd0c244bb7fedc85ce',
    ],
  },
}

const abi = {
  totalAssets: 'uint256:totalAssets',
  asset: 'address:asset',
}

async function tvlEth(api) {
  const vaults = config.ethereum.vaults
  const tokens = await api.multiCall({ abi: abi.asset, calls: vaults })
  const balances = await api.multiCall({ 
    abi: abi.totalAssets,
    calls: vaults,
    permitFailure: true
  })

  // multicall sensitive vault
  const vault = '0x6C99a74a62Aaf2e6Aa3fF08Ce7661D5C86E01DbC';
  const vaultTotal = await api.call({
    target: vault,
    abi: abi.totalAssets,
  });
  const vaultAsset = await api.call({
    target: vault,
    abi: abi.asset,
  });

  tokens.push(vaultAsset);
  balances.push(vaultTotal);

  api.add(tokens, balances)
}

async function tvlBase(api) {
  const vaults = config.base.vaults
  const tokens = await api.multiCall({ abi: abi.asset, calls: vaults })
  const balances = await api.multiCall({ abi: abi.totalAssets, calls: vaults })

  api.add(tokens, balances)
}

module.exports = {
  methodology: 'Sum of ERC-4626 totalAssets() for Credit Coop vaults, valued in their underlying assets.',
  ethereum: {  tvl: tvlEth },
  base: { tvl: tvlBase },
}

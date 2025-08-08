/**
 * Kernel DAO contracts
 * 
 * @see https://github.com/Kelp-DAO/kernel-smart-contracts-private/blob/develop/doc/contract-address/Mainnet.md
 */
const ASSET_REGISTRY = '0xd0B91Fc0a323bbb726faAF8867CdB1cA98c44ABB';


async function tvl(api) {
  const tokens = await api.call({  abi: 'address[]:getAssets', target: ASSET_REGISTRY})
  const vaults = await api.multiCall({  abi: 'function getVault(address) view returns (address)', calls: tokens, target: ASSET_REGISTRY})
  return api.sumTokens({ tokensAndOwners2: [tokens, vaults]})
}

module.exports = {
  methodology: 'Calculates total TVL.',
  start: 1733817000,
  bsc: {
    tvl,
  }
};

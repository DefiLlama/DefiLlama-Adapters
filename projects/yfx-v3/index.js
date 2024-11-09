const manager = '0x29bd0372A8A087e4d34d4098259Cd298d554BAc4';
const vault = '0x48F4B8f77b1E0EFBBF17b2082F12829b87FD1933';

async function tvl(api) {
  let pools = await api.call({ target: manager, abi: "address[]:getAllPools", });
  const tokens = await api.multiCall({ abi: 'address:getBaseAsset', calls: pools })
  return api.sumTokens({ owner: vault, tokens})
}

module.exports = {
  methodology: 'Count balance of each pool from the Vault',
  arbitrum: {
    tvl,
  },
}
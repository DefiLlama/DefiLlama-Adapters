const manager = '0xFE1ca968afbadEd3BF2CB685451C858Deb46Ce31';
const vault = '0x50b516a9DB620aB67A33d895DAF4Bd1c294b9517';

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

const { getAccount, Slice } = require('../helper/chain/venom')

// StEverVault, address from the venomstake.com frontend
const VAULT = '0:9df94dffc0ca1768647f819c04b2cf00c484b3b756ba6ecde68d5fb62de1dfc7'

// vault storage (ABI 2.2 fields): _pubkey uint256, _timestamp uint64, _constructorFlag bool, nonce uint128,
// governance uint256, 3 code cells (refs), stEverSupply uint128, totalAssets uint128, ... (rest chained in the 4th ref)
async function tvl(api) {
  const { data } = await getAccount(VAULT)
  const s = new Slice(data)
  s.skip(256 + 64)
  if (!s.bit()) throw new Error('venomstake: vault storage not initialized')
  s.skip(128 + 256)
  s.skip(128) // stEverSupply
  const totalAssets = s.uint(128)
  api.addCGToken('venom', Number(totalAssets) / 1e9)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the totalAssets (VENOM held by the vault plus VENOM delegated to its DePool strategies) of the VenomStake StEverVault, decoded from the vault account state.',
  venom: { tvl },
}

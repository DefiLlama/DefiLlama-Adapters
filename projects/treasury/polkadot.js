const { getStorage, getSystemAccount, ss58Decode, encodeU32, encodeCompact, decodeUint, decodeOrmlAccountData } = require('../helper/chain/substrate')

const RELAY_CHAIN_TREASURY = "13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB";
const ASSET_HUB_TREASURY = "14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk";
const ASSET_HUB_FELLOWSHIP_SALARY = "13w7NdvSR1Af8xsQTArDtZmVvjE8XhWNdL4yed3iFHrUNCnS";
const ASSET_HUB_FELLOWSHIP_SUB_TREASURY = "16VcQSRcMFy6ZHVjBvosKmo7FKqTb8ZATChDYo8ibutzLnos";
const ASSET_HUB_MYTHOS_TREASURY = "13gYFscwJFJFqFMNnttzuTtMrApUEmcUARtgFubbChU9g6mh";
const HDX_FELLOWSHIP_SALARY_SWAP = "7KQx4f7yU3hqZHfvDVnSfe6mpgAT8Pxyr67LXHV6nsbZo3Tm";
const HDX_TREASURY_STABLES_SWAP_ONE = "7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY";
const HDX_TREASURY_STABLES_SWAP_TWO = "7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV";
const HDX_TREASURY_STABLES_SWAP_THREE = "7KATdGaecnKi4zDAMWQxpB2s59N2RE1JgLuugCjTsRZHgP24";

const ASSET_HUB_ADDRESSES = [ASSET_HUB_TREASURY, ASSET_HUB_FELLOWSHIP_SALARY, ASSET_HUB_FELLOWSHIP_SUB_TREASURY]
const HYDRATION_ADDRESSES = [HDX_FELLOWSHIP_SALARY_SWAP, HDX_TREASURY_STABLES_SWAP_ONE, HDX_TREASURY_STABLES_SWAP_TWO, HDX_TREASURY_STABLES_SWAP_THREE]

const ASSET_HUB_ASSETS = { 'usd-coin': { id: 1337, decimals: 6 }, tether: { id: 1984, decimals: 6 } }
const HYDRATION_ASSETS = { 'usd-coin': { id: 10, decimals: 6 }, tether: { id: 22, decimals: 6 }, polkadot: { id: 5, decimals: 10 } }

const DOT_DECIMALS = 1e10;
const MYTHOS_DECIMALS = 1e18;

const RELAY = 'polkadot_relay'
const ASSET_HUB = 'polkadot_assethub'
const HYDRATION = 'hydration'

// MYTH on asset hub is a foreign asset keyed by its XCM Location { parents: 1, interior: X1([Parachain(3369)]) }
const MYTHOS_LOCATION = Buffer.concat([Buffer.from([1, 1, 0]), encodeCompact(3369)])

async function getDotBalance(chain, address) {
  const { free, reserved } = await getSystemAccount(chain, address)
  return Number(free + reserved) / DOT_DECIMALS
}

// pallet_assets Assets.Account(AssetId: Blake2_128Concat, AccountId: Blake2_128Concat) => AssetAccount { balance: u128, ... }
async function getAssetHubAssetBalance(pallet, assetKey, address) {
  const value = await getStorage(ASSET_HUB, {
    pallet, item: 'Account',
    keys: [{ hasher: 'Blake2_128Concat', key: assetKey }, { hasher: 'Blake2_128Concat', key: ss58Decode(address) }],
  })
  return decodeUint(value)
}

// orml Tokens.Accounts(AccountId: Blake2_128Concat, AssetId u32: Twox64Concat)
async function getHydrationBalance(address, assetId) {
  const value = await getStorage(HYDRATION, {
    pallet: 'Tokens', item: 'Accounts',
    keys: [{ hasher: 'Blake2_128Concat', key: ss58Decode(address) }, { hasher: 'Twox64Concat', key: encodeU32(assetId) }],
  })
  const { free, reserved } = decodeOrmlAccountData(value)
  return free + reserved
}

async function tvl(api) {
  for (const address of ASSET_HUB_ADDRESSES)
    for (const [cgId, { id, decimals }] of Object.entries(ASSET_HUB_ASSETS))
      api.addCGToken(cgId, Number(await getAssetHubAssetBalance('Assets', encodeU32(id), address)) / 10 ** decimals)

  for (const address of HYDRATION_ADDRESSES)
    for (const [cgId, { id, decimals }] of Object.entries(HYDRATION_ASSETS)) {
      if (cgId === 'polkadot') continue
      api.addCGToken(cgId, Number(await getHydrationBalance(address, id)) / 10 ** decimals)
    }

  api.addCGToken('mythos', Number(await getAssetHubAssetBalance('ForeignAssets', MYTHOS_LOCATION, ASSET_HUB_MYTHOS_TREASURY)) / MYTHOS_DECIMALS)
  return api.getBalances();
}

async function ownTokens(api) {
  api.addCGToken('polkadot', await getDotBalance(RELAY, RELAY_CHAIN_TREASURY))
  for (const address of ASSET_HUB_ADDRESSES)
    api.addCGToken('polkadot', await getDotBalance(ASSET_HUB, address))
  for (const address of HYDRATION_ADDRESSES)
    api.addCGToken('polkadot', Number(await getHydrationBalance(address, HYDRATION_ASSETS.polkadot.id)) / DOT_DECIMALS)
  return api.getBalances();
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is calculated by summing up the balances across three chains: Relay Chain (DOT), Asset Hub (DOT, USDC, USDT, MYTHOS), and Hydration (DOT, USDC, USDT). The balances are fetched directly from the respective chain's treasury and related addresses.",
  polkadot: { tvl, ownTokens, },
};

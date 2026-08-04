const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
const { callSoroban, getContractInstanceStorage } = require('../helper/chain/stellar');

const abi = {
  assets: 'function assets(address) view returns (address assetAddress, address msvAddress, uint8 status, uint256 protocolFees)',
}

const VAQUITA_POOL_BASE = '0x2400B4E44878d25597da16659705F48927cadef1';

const assets = {
  USDC: {
    address: ADDRESSES.base.USDC,
    aToken: '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB',
  },
  WETH: {
    address: ADDRESSES.null,
    aToken: '0xD4a0e0b9149BCee3C920d2E00b5dE09138fd8bb7',
  },
  cbBTC: {
    address: ADDRESSES.ethereum.cbBTC,
    aToken: '0xBdb9300b7CDE636d9cD4AFF00f6F009fFBBc8EE6',
  },
};

async function tvl(api) {
  const assetEntries = Object.entries(assets);
  
  const assetData = await api.multiCall({
    abi: abi.assets,
    calls: assetEntries.map(([_, asset]) => ({
      target: VAQUITA_POOL_BASE,
      params: [asset.address]
    })),
    permitFailure: true
  });
  
  const owners = [];
  const tokens = [];
  
  assetData.forEach((data, index) => {
    if (data && data.msvAddress) {
      const [_, asset] = assetEntries[index];
      owners.push(data.msvAddress);
      tokens.push(asset.aToken);
    }
  });

  return sumTokens2({ api, owners, tokens });
}

// Vaquita fixed-yield pool on Stellar mainnet. User principal is routed into a
// Vaquita-deployed and Vaquita-managed DeFindex vault; the reward pool that
// backs the fixed yield sits in the pool contract as idle deposit token.
const VAQUITA_POOL_STELLAR = 'CDTTAZ3NK4MMDHK2C3I6LRDT4YADJZ2QXINKLKQNZUVX7OTUKQNCQGC4';

async function stellarTvl(api) {
  // Read live config from instance storage so admin updates to the deposit
  // token / vault are picked up without an adapter change.
  const { BlendToken: token, DeFindexVaultAddress: vault } = await getContractInstanceStorage(VAQUITA_POOL_STELLAR);

  // Reward pool held directly by the pool contract, outside the vault.
  const idle = await callSoroban(token, 'balance', [VAQUITA_POOL_STELLAR]);
  api.add(token, idle);

  // The vault is a Vaquita product, so all of its deposits count, not just the
  // share of it held by the pool. total_amount covers idle + strategy-invested.
  const funds = await callSoroban(vault, 'fetch_total_managed_funds');
  for (const { asset, total_amount } of funds) {
    if (asset && total_amount != null) api.add(asset, total_amount.toString());
  }
}

module.exports = {
  base: { tvl },
  stellar: { tvl: stellarTvl },
  methodology: 'On Base, TVL is the aToken balance held by each MSV (MultiStrategyVault) contract for each supported asset. On Stellar, TVL is the total assets managed by the Vaquita-deployed DeFindex vault (fetch_total_managed_funds, covering both idle and strategy-invested amounts), plus the idle deposit token balance held by the Vaquita pool contract to back the fixed-yield reward pool.',
};

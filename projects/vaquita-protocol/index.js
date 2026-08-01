const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');

const abi = {
  assets: 'function assets(address) view returns (address assetAddress, address msvAddress, uint8 status, uint256 protocolFees)',
}

const VAQUITA_CONTRACT = '0x2400B4E44878d25597da16659705F48927cadef1';

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
      target: VAQUITA_CONTRACT,
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

module.exports = {
  base: { tvl }, 
  methodology: 'TVL is calculated by checking the aToken balance held by each MSV (MultiStrategyVault) contract for each supported asset in Vaquita Protocol',
};

/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");
const { getAssets } = require("./api");

const API_CALL_CHUNK_SIZE = 25;

const IDEX_ETHEREUM_CUSTODY_CONTRACT = "0xE5c405C5578d84c5231D3a9a29Ef4374423fA0c2";
const IDEX_POLYGON_CUSTODY_CONTRACT = "0x3bcc4eca0a40358558ca8d1bcd2d1dbde63eb468";

/*==================================================
  TVL
  ==================================================*/

async function tvl(_timestamp, block, chainBlocks, chain) {
  let assets = [];
  let nativeSymbol = '';
  let nativeAddress = '';
  let transformAddress = undefined;

  switch (chain) {
    case 'polygon':
      assets = await getAssets();
      block = chainBlocks['polygon'] || block;
      nativeSymbol = 'MATIC';
      nativeAddress = '0x0000000000000000000000000000000000001010';
      transformAddress = (address) => `polygon:${address}`;
      custodian = IDEX_POLYGON_CUSTODY_CONTRACT;
      break;
    case 'ethereum':
      assets = await sdk.api.util.tokenList();
      nativeSymbol = 'ETH';
      nativeAddress = '0x0000000000000000000000000000000000000000';
      transformAddress = (address) => address;
      custodian = IDEX_ETHEREUM_CUSTODY_CONTRACT;
      break;
    default:
      throw new Error('Unknown chain ' + chain);
  }

  const balances = {
    [transformAddress(nativeAddress)]: (
      await sdk.api.eth.getBalance({ target: custodian, block, chain })
    ).output
  };

  const allCalls = assets.reduce((arr, asset) => {
    if (asset.symbol !== nativeSymbol) {
      const address = asset.contractAddress || asset.contract;
      if (address.indexOf('0x') === 0) { // sanity, token list may have some bad values
        arr.push({
          target: asset.contractAddress || asset.contract,
          params: [custodian],
        });
      }
    }
    return arr;
  }, []);

  while (allCalls.length) {
    const calls = allCalls.splice(0, API_CALL_CHUNK_SIZE);
    const assetBalancesResult = await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      block,
      chain,
      calls,
      requery: false,
    });
    sdk.util.sumMultiBalanceOf(balances, assetBalancesResult, false, transformAddress);
  }

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

const ethereumTvl = (_timestamp, block, chainBlocks) => tvl(_timestamp, block, chainBlocks, 'ethereum')
const polygonTvl = (_timestamp, block, chainBlocks) => tvl(_timestamp, block, chainBlocks, 'polygon')

module.exports = {
  ethereum: {
    start: 1603166400,
    tvl: ethereumTvl,
  },
  polygon: {
    start: 1638316800,
    tvl: polygonTvl,
  },
};

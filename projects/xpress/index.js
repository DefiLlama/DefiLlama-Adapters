const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const LOB_FACTORY = '0xB9A10c289eEb586556ed381f3d9E44F10Bda243f';

const createdLOBEventAbi = {
  "type": "event",
  "name": "OnchainCLOBCreated",
  "inputs": [
    {
      "name": "creator",
      "type": "address",
      "indexed": true,
      "internalType": "address"
    },
    {
      "name": "OnchainCLOB",
      "type": "address",
      "indexed": false,
      "internalType": "address"
    },
    {
      "name": "tokenXAddress",
      "type": "address",
      "indexed": false,
      "internalType": "address"
    },
    {
      "name": "tokenYAddress",
      "type": "address",
      "indexed": false,
      "internalType": "address"
    },
    {
      "name": "supports_native_eth",
      "type": "bool",
      "indexed": false,
      "internalType": "bool"
    },
    {
      "name": "scaling_token_x",
      "type": "uint256",
      "indexed": false,
      "internalType": "uint256"
    },
    {
      "name": "scaling_token_y",
      "type": "uint256",
      "indexed": false,
      "internalType": "uint256"
    },
    {
      "name": "administrator",
      "type": "address",
      "indexed": false,
      "internalType": "address"
    },
    {
      "name": "marketmaker",
      "type": "address",
      "indexed": false,
      "internalType": "address"
    },
    {
      "name": "pauser",
      "type": "address",
      "indexed": false,
      "internalType": "address"
    },
    {
      "name": "should_invoke_on_trade",
      "type": "bool",
      "indexed": false,
      "internalType": "bool"
    },
    {
      "name": "admin_commission_rate",
      "type": "uint64",
      "indexed": false,
      "internalType": "uint64"
    },
    {
      "name": "total_aggressive_commission_rate",
      "type": "uint64",
      "indexed": false,
      "internalType": "uint64"
    },
    {
      "name": "total_passive_commission_rate",
      "type": "uint64",
      "indexed": false,
      "internalType": "uint64"
    },
    {
      "name": "passive_order_payout",
      "type": "uint64",
      "indexed": false,
      "internalType": "uint64"
    }
  ],
  "anonymous": false
}

async function tvl(api) {
  const lobCreatedLogs = await getLogs2({
    api,
    factory: LOB_FACTORY,
    eventAbi: createdLOBEventAbi,
    fromBlock: 2193228,
  })

  const [tokenXBalances, tokenYBalances] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', calls: lobCreatedLogs.map(log => ({ target: log.tokenXAddress, params: log.OnchainCLOB })) }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: lobCreatedLogs.map(log => ({ target: log.tokenYAddress, params: log.OnchainCLOB })) })
  ]);

  lobCreatedLogs.forEach((lob, i) => {
    api.add([lob.tokenXAddress, lob.tokenYAddress], [tokenXBalances[i], tokenYBalances[i]]);
  });

  return sumTokens2({ api })
}
  
module.exports = {
  sonic: { tvl }
}
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const DEPOSIT_POOL = "0x036676389e48133B63a802f8635AD39E752D375D";
const rstETH = '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7'

const oft_tokens = {
  'arbitrum' : ADDRESSES.berachain.rsETH,
  'optimism' : ADDRESSES.berachain.rsETH,
  'manta' : ADDRESSES.berachain.rsETH,
  'mode' : ADDRESSES.berachain.rsETH,
  'blast' : ADDRESSES.berachain.rsETH,
  'scroll' : '0x65421ba909200b81640d98B979d07487C9781B66',
  'base' : '0x1Bc71130A0e39942a7658878169764Bbd8A45993',
  'linea' : ADDRESSES.berachain.rsETH,
  'xlayer' : '0x1B3a9A689Ba7555F9D7984D7Ad4025574Ed5A0f9',
  'era' : '0x6bE2425C381eb034045b527780D2Bf4E21AB7236',
  'zircuit' : ADDRESSES.berachain.rsETH,
  'swellchain' : ADDRESSES.swellchain.rsETH,
  'hemi' : ADDRESSES.swellchain.rsETH,
  'berachain' : ADDRESSES.berachain.rsETH,
  'sonic' : '0xd75787bA9ABa324420d522BdA84c08c87e5099b1'
}

async function tvl(api) {
  const supplies = await oft_supplies(api)
  const config = await api.call({  abi: 'address:lrtConfig', target: DEPOSIT_POOL})
  const tokens = await api.call({  abi: 'address[]:getSupportedAssetList', target: config})
  const bals = await api.multiCall({  abi: 'function getTotalAssetDeposits(address) external view returns (uint256)', calls: tokens, target: DEPOSIT_POOL})
  api.addTokens(tokens, bals);
  api.addTokens(rstETH, - supplies) // We subtract the rstETH oft on other chains from ethereum chain to avoid double counting once bridged
  return api.getBalances()
}


const oft_tvls = async (api, oft) => {
  const oft_supply = await api.call({  abi: 'erc20:totalSupply', target: oft})
  api.add(rstETH, oft_supply, { skipChain: true })
}

const oft_supplies = async (api) => {
  const totalSupplies = await Promise.all(
    Object.keys(oft_tokens).map(async (chain) => {
      const chainApi = new sdk.ChainApi({ chain, timestamp: api.timestamp})
      // await chainApi.getBlock()
      return chainApi.call({ abi: 'erc20:totalSupply', target: oft_tokens[chain] });
    })
  );
  return totalSupplies.reduce((sum, value) => sum + Number(value), 0);
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology:
    "deposited LSTs in deposit pool, node delegator contracts and from them into eigenlayer strategy contracts",
  ethereum: {
    tvl,
  },
};

Object.keys(oft_tokens).forEach((chain) => {
  const contract = oft_tokens[chain];
  module.exports[chain] = {
    tvl: async (api) => oft_tvls(api, contract),
  };
});

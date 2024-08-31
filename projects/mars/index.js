const sdk = require('@defillama/sdk');

const { endPoints, queryContract, sumTokens} = require('../helper/chain/cosmos');
const { getChainTransform } = require('../helper/portedTokens');
const { get } = require('../helper/http');

const addresses = {
  osmosis: {
    redBank: 'osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg',
    creditManager: 'osmo1f2m24wktq0sw3c0lexlg7fv4kngwyttvzws3a3r3al9ld2s2pvds87jqvf',
    params: 'osmo1nlmdxt9ctql2jr47qd4fpgzg84cjswxyw6q99u4y4u4q6c2f5ksq7ysent'
  },
  neutron: {
    redBank: 'neutron1n97wnm7q6d2hrcna3rqlnyqw2we6k0l8uqvmyqq6gsml92epdu7quugyph',
    creditManager: 'neutron1qdzn3l4kn7gsjna2tfpg3g3mwd6kunx4p50lfya59k02846xas6qslgs3r',
    params: 'neutron1x4rgd7ry23v2n49y7xdzje0743c5tgrnqrqsvwyya2h6m48tz4jqqex06x'
  }
}


// OSMOSIS

async function osmosisTVL() {
  let balances = {};
  await addRedBankTvl(balances, 'osmosis');
  await addCreditManagerTvl(balances, 'osmosis');
  return balances;
}

// NEUTRON

async function neutronTVL() {
  let balances = {};
  await addRedBankTvl(balances, 'neutron');
  await addCreditManagerTvl(balances, 'neutron');
  return balances;
}

// HELPERS

async function addRedBankTvl(balances, chain) {
  await sumTokens({balances, owners: [addresses[chain].redBank], chain});
}

async function addCreditManagerTvl(balances, chain) {
  await sumTokens({balances, owners: [addresses[chain].creditManager], chain});
}

function getEndpoint(chain) {
  if (!endPoints[chain]) throw new Error('Chain not found: ' + chain);
  return endPoints[chain];
}

async function cosmosLCDQuery(url, chain) {
  let endpoint = `${getEndpoint(chain)}/${url}`;
  let request =  await get(endpoint);
  return request;
}

async function cosmosDenomBalanceStr(chain, denom, owner) {
  let url = `cosmos/bank/v1beta1/balances/${owner}/by_denom?denom=${denom}`;
  let balance = await cosmosLCDQuery(url, chain);
  return balance.balance.amount;
}

module.exports = {
  timetravel: false,
  methodology: 'For each chain, sum token balances in Red Bank/Credit Manager smart contracts to approximate net deposits, plus vault underlying assets held in Rover',
  osmosis: {
    tvl: osmosisTVL,
  },
  neutron: {
    tvl: neutronTVL,
  },
  terra: {
    tvl: () => 0,
  },
   hallmarks:[
    [1651881600, 'UST depeg'],
    [1675774800, 'Relaunch on Osmosis'],
    [1690945200, 'Red Bank launch on Neutron'],
    [1696906800, 'Mars V2 launch on Osmosis'],
    [1724166000, 'Mars v2 Launch on Neutron']
  ]
};

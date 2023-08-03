const sdk = require('@defillama/sdk');
const axios = require('axios');

const { endPoints, queryContract, sumTokens } = require('../helper/chain/cosmos');
const { getChainTransform } = require('../helper/portedTokens');

const addresses = {
  osmosis: {
    redBank: 'osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg',
    creditManager: 'osmo1f2m24wktq0sw3c0lexlg7fv4kngwyttvzws3a3r3al9ld2s2pvds87jqvf',
  },
  neutron: {
    redBank: 'neutron1n97wnm7q6d2hrcna3rqlnyqw2we6k0l8uqvmyqq6gsml92epdu7quugyph',
  }
}


// OSMOSIS

async function osmosisTVL() {
  let balances = {};
  await addRedBankTvl(balances, 'osmosis');
  await osmosisSumVaultsTVL(balances);
  return balances;
}

async function osmosisSumVaultsTVL(balances) {
  let coins = [];
  let vaultPagesRemaining = true;
  let startAfter = null;
  const pageLimit = 10;
  const osmosisDenomTransform = await getChainTransform('osmosis');

  while (vaultPagesRemaining) {
    const fieldsVaultsInfo = await queryContract({
      contract: addresses.osmosis.creditManager,
      chain: 'osmosis',
      data: { 'vaults_info': { limit: pageLimit, 'start_after': startAfter } } 
    });

    if(fieldsVaultsInfo.length === pageLimit) {
      startAfter = fieldsVaultsInfo[fieldsVaultsInfo.length - 1].vault;
      vaultPagesRemaining = true
    } else {
      vaultPagesRemaining = false;
    }

    await osmosisAddCoinsForVaultsInfoPage(coins, fieldsVaultsInfo);
  }

  coins.forEach(coin =>  {
    sdk.util.sumSingleBalance(balances, osmosisDenomTransform(coin.denom), coin.amount);
  })
}

async function osmosisAddCoinsForVaultsInfoPage(coins, fieldsVaultsInfoPage) {
    let vaultsMetadata = fieldsVaultsInfoPage.map(rvi => ({ fieldsVaultInfo: rvi }));

    // query the vault info for the vault contract itself to get the vault's
    // base token
    await Promise.all(vaultsMetadata.map(async vm => {
      let vaultInfo = await queryContract({
        contract: vm.fieldsVaultInfo.vault.address,
        chain: 'osmosis',
        data: { 'info': {} } 
      });
      vm.vaultInfo = vaultInfo;
    }));

    // get total vault shares owned by fields for each vault
    await Promise.all(vaultsMetadata.map(async vm => {
      let vaultShares = await queryContract({
        contract: addresses.osmosis.creditManager,
        chain: 'osmosis',
        data: { 'total_vault_coin_balance': { vault: vm.fieldsVaultInfo.vault } } 
      });
      vm.vaultShares = vaultShares;
    }));

    // convert vault shares to vault base asset
    await Promise.all(vaultsMetadata.map( async vm => {
      let query = {
        contract: vm.fieldsVaultInfo.vault.address,
        chain: 'osmosis',
        data: { 'convert_to_assets': { amount: vm.vaultShares } } 
      };
      let amount = await queryContract(query);
      vm.baseTokenAmount = amount;
    }));

    // Add coins to then be added to balances
    //  * For gamm lp tokens compute the share of underlying assets and add those
    //  * For other assets, add as is
    await Promise.all(vaultsMetadata.map( async vm => {
      const baseToken = vm.vaultInfo['base_token'];
      if (baseToken.startsWith('gamm/pool/')) {
        let poolId = baseToken.split('/')[2];
        const url = `osmosis/gamm/v1beta1/pools/${poolId}`;
        const query = await cosmosLCDQuery(url, 'osmosis');
        const pool = query.pool;
        pool['pool_assets'].forEach(asset => {
          const denom = asset.token.denom;
          const amount = asset.token.amount * vm.baseTokenAmount / pool['total_shares'].amount;
          coins.push({denom, amount});
        });
      } else {
        coins.push({denom: baseToken, amount: vm.baseTokenAmount});
      }
    }));
}

// NEUTRON

async function neutronTVL() {
  let balances = {};
  await addRedBankTvl(balances, 'neutron');
  return balances;
}

// HELPERS

async function addRedBankTvl(balances, chain) {
  await sumTokens({balances, owners: [addresses[chain].redBank], chain});
}

function getEndpoint(chain) {
  if (!endPoints[chain]) throw new Error('Chain not found: ' + chain);
  return endPoints[chain];
}

async function cosmosLCDQuery(url, chain) {
  let endpoint = `${getEndpoint(chain)}/${url}`;
  let request =  await axios.get(endpoint);
  return request.data;
}

module.exports = {
  timetravel: false,
  methodology: 'For each chain, sum up token balances in Red Bank smart contracts and vault underlying assets in Fields smart contracts',
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
  ]
};


const { get } = require('../helper/http')
const ADDRESSES = require("../helper/coreAssets.json");
const { getJettonBalances } = require('../helper/chain/ton')

async function fetchVaultData(address) {
  const url = 'https://api5.storm.tg/graphql';
  
  const query = `
    query VaultQuery($address: String!) {
      getVault(address: $address) {
        rate
      }
    }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'VaultQuery',
        variables: { address },
        query
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.getVault;
  } catch (error) {
    console.error('Error fetching vault data:', error);
    throw error;
  }
}

async function calculateTvl() {
  const USDT_TLP_PRICE = (await get('https://tradoor.io/v3/lp/history/price?period=week')).data[0].price;
  
  const vaultData = await fetchVaultData('0:33e9e84d7cbefff0d23b395875420e3a1ecb82e241692be89c7ea2bd27716b77');
  const USDT_SLP_PRICE = vaultData?.rate / 1e9 || 0;

  const balances = await getJettonBalances('0:c2f0c639b58e6b3cce8a145c73e7c7cc5044baa92b05c62fcf6da8a0d50b8edc');

  const USDT_SLP_ADDRESS = '0:aea78c710ae94270dc263a870cf47b4360f53cc5ed38e3db502e9e9afb904b11';
  const USDT_TLP_ADDRESS = '0:332c916f885a26051cb3a121f00c2bda459339eb103df36fe484df0b87b39384';

  const USDT_SLP_BALANCE = balances[USDT_SLP_ADDRESS].balance / 1e9;
  const USDT_TLP_BALANCE = balances[USDT_TLP_ADDRESS].balance / 1e9;

  const tvl = ((USDT_TLP_PRICE * USDT_TLP_BALANCE) + (USDT_SLP_PRICE * USDT_SLP_BALANCE)) * 1e6;
  return tvl;
}


async function tvl(api) {
  const calculatedTvl = await calculateTvl();
  api.add(ADDRESSES.ton.USDT, calculatedTvl);
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: `TVL calculation methodology consists of the delta between onchain USDT deposits and withdrawals`.trim(),
  ton: {
    tvl
  }
}

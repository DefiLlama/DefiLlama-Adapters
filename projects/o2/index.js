const { tradingAccountRegistryAbi } = require('./abi');
const { query, sumTokens } = require('../helper/chain/fuel');

const tradingAccountRegistryContractId = '0x284c6802ad33bb95a37a1113106238ee9d084aa337879b62d2c3a8a74401cdb2';
const queryPageSize = 50;

async function tvl(api) {
  let contractIds = [];

  for (let page = 0; ; page++) {
    const tradingAccountPage = await query({ contractId: tradingAccountRegistryContractId, abi: tradingAccountRegistryAbi, method: 'get_trade_accounts', params: [page] });
    const tradingAccountPageContractIds = tradingAccountPage.items.map((item) => item.contract_id.bits);
    contractIds = contractIds.concat(tradingAccountPageContractIds);
    if (tradingAccountPage.items.length < queryPageSize) break;
  }

  return sumTokens({ api, owners: contractIds })
}

module.exports = {
  methodology: 'The TVL is defined as the total sum of assets across all user trading accounts',
  fuel: { tvl }
};

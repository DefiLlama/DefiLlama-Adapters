const { get } = require('../helper/http');
const sdk = require('@defillama/sdk');

const ONFA_RPC = process.env.ONFA_RPC;

async function tvl() {
  const balances = {};
  
  // Lấy dữ liệu từ Smart Contract của ONFA Chain (Ví dụ giả định)
  const totalSupply = await sdk.api.erc20.totalSupply({
    target: '0x2CD63B34B308f379c18852aB294389eE26D6C5FA', // Thay bằng địa chỉ token thực tế
    chain: 'onfa',
    block: 'latest',
  });

  sdk.util.sumSingleBalance(balances, '0x2CD63B34B308f379c18852aB294389eE26D6C5FA', totalSupply.output);
  
  return balances;
}

module.exports = {
  onfa: {
    tvl,
  }
};

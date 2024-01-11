const { queryV1Beta1 } = require("../helper/chain/cosmos");
const sdk = require("@defillama/sdk");

async function tvl() {
  const data1 = await queryV1Beta1({ chain: 'cronos', url: '/staking/v1beta1/delegations/cro1l3weyh4fkneyeatdh6jwp0u0t4qha22ycpnq7r', }); //account1
  const data2 = await queryV1Beta1({ chain: 'cronos', url: '/staking/v1beta1/delegations/cro1zqvl7yj0zcqe7p0qnpg0sk94gpa38hzwz8shjn', }); //account2
  const data3 = await queryV1Beta1({ chain: 'cronos', url: '/staking/v1beta1/delegations/cro1pduq0ga2ans0sspph6r5hcf77cqypz6de7n64y', }); //account3
  const data4 = await queryV1Beta1({ chain: 'cronos', url: '/staking/v1beta1/delegations/cro1fncg0fsr8vt30qaqmzqxunnrkxr6a7xxkfpr7y', }); //account4
  const data5 = await queryV1Beta1({ chain: 'cronos', url: '/staking/v1beta1/delegations/cro1hhfh6xaflg8zwhwvrs7sgur2pyfunjqeu8wsd6', }); //account5

  let total1 = data1.delegation_responses.reduce((a, i) => a += +i.balance.amount, 0);
  let total2 = data2.delegation_responses.reduce((a, i) => a += +i.balance.amount, 0);
  let total3 = data3.delegation_responses.reduce((a, i) => a += +i.balance.amount, 0);
  let total4 = data4.delegation_responses.reduce((a, i) => a += +i.balance.amount, 0);
  let total5 = data5.delegation_responses.reduce((a, i) => a += +i.balance.amount, 0);
  let delegated_total = Number(total1) + Number(total2) + Number(total3) + Number(total4) + Number(total5);

  const wcro_contract_address    = '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23';
  const factroy_contract_address = '0x66f5997b7810723aCeEeb8a880846fC117081bd0';

  const factroy_wcro = await sdk.api.erc20.balanceOf({
      target: wcro_contract_address,
      owner: factroy_contract_address,
      decimals: 18,
      chain: 'cronos'
  });

  let total = delegated_total + Number(factroy_wcro.output) * 1e8;

  const balances = {}
  sdk.util.sumSingleBalance(balances, 'cronos:0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23', total * 1e10)
  return balances
}

module.exports = {
  timetravel: false,
  methodology: `The TVL is counted as the total delegated CRO and the flexible pool CRO. We query the crypto.org api for the delegations and sum up the CRO being delegated. We query the balanceOf the flexible pool address from WCRO contract`,
  cronos: {
    tvl,
  }
}

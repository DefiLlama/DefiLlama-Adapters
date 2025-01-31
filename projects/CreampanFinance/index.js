const ADDRESSES = require('../helper/coreAssets.json')
const { queryV1Beta1 } = require("../helper/chain/cosmos");

const accounts = Object.values({
  account1: 'cro1l3weyh4fkneyeatdh6jwp0u0t4qha22ycpnq7r',
  account2: 'cro1zqvl7yj0zcqe7p0qnpg0sk94gpa38hzwz8shjn',
  account3: 'cro1pduq0ga2ans0sspph6r5hcf77cqypz6de7n64y',
  account4: 'cro1fncg0fsr8vt30qaqmzqxunnrkxr6a7xxkfpr7y',
  account5: 'cro1hhfh6xaflg8zwhwvrs7sgur2pyfunjqeu8wsd6',
  account6: 'cro1a2vawclcntewtjd5jfjf44dr6mdfdyg8xzfe5t',
  account7: 'cro1wc43z84u8keas3ffw4ynapwe0hzfen3xx03dpd',
  account8: 'cro1ujkwlnfnl3mmka4twqx07azxk6djlplddcn48h',
  account9: 'cro16wzuj3a9tdqk9z3edx587athz2kk75gj2l6etk',
  account10: 'cro1hfx8t4nldtfk5w6h6eherfts4gtelvcn0dypc3',
})

async function tvl(api) {
  const data = await Promise.all(accounts.map(account => queryV1Beta1({ chain: 'cronos', url: `/staking/v1beta1/delegations/${account}`, })));
  const data2 = await Promise.all(accounts.map(account => queryV1Beta1({ chain: 'cronos', url: `/staking/v1beta1/delegators/${account}/unbonding_delegations`, })));
  const factory_contract_address = '0x66f5997b7810723aceeeb8a880846fc117081bd0';
  const factoryV2_contract_address = '0xfd3300b2441072b35554f1043c3d3a413fd5c219';
  data.map(i => i.delegation_responses).flat().forEach(i => api.add(ADDRESSES.cronos.WCRO, i.balance.amount * 1e10))

  for (let j = 0; j < accounts.length; j++) {
    if (Number(data2[j].pagination.total) > 0) {
      data2[j].unbonding_responses[0].entries.flat().forEach(i => api.add(ADDRESSES.cronos.WCRO, i.balance * 1e10))
    }
  }

  return api.sumTokens({ owners: [factory_contract_address, factoryV2_contract_address], tokens: [ADDRESSES.cronos.WCRO_1] })
}

module.exports = {
  timetravel: false,
  methodology: `The TVL is counted as the total delegated CRO and the flexible pool CRO. We query the crypto.org api for the delegations and sum up the CRO being delegated. We query the balanceOf the flexible pool address from WCRO contract`,
  cronos: {
    tvl,
  }
}

const ADDRESSES = require('../helper/coreAssets.json')
const { queryV1Beta1 } = require("../helper/chain/cosmos");

const accounts = Object.values({
  account1: 'cro1l3weyh4fkneyeatdh6jwp0u0t4qha22ycpnq7r',
  account2: 'cro1zqvl7yj0zcqe7p0qnpg0sk94gpa38hzwz8shjn',
  account3: 'cro1pduq0ga2ans0sspph6r5hcf77cqypz6de7n64y',
  account4: 'cro1fncg0fsr8vt30qaqmzqxunnrkxr6a7xxkfpr7y',
  account5: 'cro1hhfh6xaflg8zwhwvrs7sgur2pyfunjqeu8wsd6',
})

async function tvl(api) {
  const data = await Promise.all(accounts.map(account => queryV1Beta1({ chain: 'cronos', url: `/staking/v1beta1/delegations/${account}`, })));
  const factroy_contract_address = '0x66f5997b7810723aceeeb8a880846fc117081bd0';
  data.map(i => i.delegation_responses).flat().forEach(i => api.add(ADDRESSES.cronos.WCRO, i.balance.amount * 1e10))
  return api.sumTokens({ owner: factroy_contract_address, tokens: ['0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23']})
}

module.exports = {
  timetravel: false,
  methodology: `The TVL is counted as the total delegated CRO and the flexible pool CRO. We query the crypto.org api for the delegations and sum up the CRO being delegated. We query the balanceOf the flexible pool address from WCRO contract`,
  cronos: {
    tvl,
  }
}

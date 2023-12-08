const { sumTokens, queryAddresses } = require('../helper/chain/radixdlt');

const STAKING_COMPONENT_ADDRESS = 'component_rdx1cz6ed6wksa2u4a3da5qfeg4tg453tczexulcf0z7vs885rkr6r6363';

module.exports = {
   radixdlt: {
      tvl: async (_, _1, _2, { api }) => {
         const data = await queryAddresses({ addresses: [STAKING_COMPONENT_ADDRESS] });
         const owners = data.map((i) => i.details.state.fields.find((i) => i.type_name === 'GlobalOneResourcePool').value);
         return sumTokens({ owners, api });
      },
   },
   timetravel: false,
};

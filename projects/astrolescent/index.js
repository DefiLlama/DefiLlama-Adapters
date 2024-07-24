const { sumTokens, queryAddresses } = require('../helper/chain/radixdlt');

const POOL_COMPONENT_ADDRESS = 'component_rdx1cqg95d25q8sa26k6996yxl3qg95edwqn4a775nf3s2zxy6tt22s9xf';
const STAKING_COMPONENT_ADDRESS = 'component_rdx1cz6ed6wksa2u4a3da5qfeg4tg453tczexulcf0z7vs885rkr6r6363';

module.exports = {
   methodology: `TVL consists of combining the liquidity pools and the staking portion is made up of ASTRL deposited to receive a yield`,
   radixdlt: {
      tvl: async (api) => {
         const data = await queryAddresses({ addresses: [POOL_COMPONENT_ADDRESS] });
         const owners = data.map((i) => i.details.state.fields.find((i) => i.type_name === 'GlobalOneResourcePool' || i.type_name == 'GlobalMultiResourcePool').value);
         return sumTokens({ owners, api });
      },
      staking: async (api) => {
         const data = await queryAddresses({ addresses: [STAKING_COMPONENT_ADDRESS] });
         const owners = data.map((i) => i.details.state.fields.find((i) => i.type_name === 'GlobalOneResourcePool' || i.type_name == 'GlobalMultiResourcePool').value);
         return sumTokens({ owners, api });
      },
   },
   timetravel: false,
};

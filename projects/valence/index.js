const { queryContract, queryV1Beta1,sumTokens,getBalance2, unwrapLp } = require("../helper/chain/cosmos");
const { queryValencePrograms,extractAccountAddressesForChain } = require("../helper/valence");

const CONFIG = {
  // contract storing all deployed Valence Programs
  VALANCE_PROTOCOL_REGISTRY_ADDRESS: "neutron1d8me7p72yq95sqnq5jpk34nn4t2vdl30yff29r05250ef92mr80saqcl2f",
  // addresses for pool from early version of Valance Protocol
  V1_COVENANTS_POOLER_ADDRESSES: [
    // Staked indicates if the asset is staked by the pooler.
    // If so, we must query the pool address for the balance to determine the value. If not staked, we can lookup the balance directly.
    {
      address: "neutron1ulaxj0nelxshdua6l5mdkcqxa5k3gvcc8ut9w5867ej7u80qjx9s5cq5yh", //stars
      staked: true,
    },
    {
      address: "neutron1quwzg6ntuy2tvvdt73rr4e8zkeetu2v5mehjfykrzszlkjavupvsn98wx9", //shade
      staked: true,
    },
    {
      address: "neutron1nqd6ge2r9ndkgkl67js35v6wln093euvvkyynr43fs4lghj7vzgsl4va57", //nolus
      staked: true,
    },
    {
      address: "neutron1yj6m02det6qd6wdugtfytfryzcmt9z9apls0sf4ww07hqq54zexqt5xgaq", //mars
      staked: false,
    },
  ]
}

/***
 * Value of tokens being held in Valence accounts
 */
async function getValenceAccountTvl(api, valenceDomain,chain) {
  // TODO: getCache('valence','accounts')
  // TODO: if not found, query all program configs + cache
  const allProgramConfigs = await queryValencePrograms(CONFIG.VALANCE_PROTOCOL_REGISTRY_ADDRESS);
  const allProgramAccounts = allProgramConfigs.map((program)=>{
     return Object.values(program.program_config.accounts) 
  })


  //TODO: setCache('valence','accounts',allProgramAccounts)

  const allAccountAddressesForChain = allProgramAccounts.map((accounts)=>extractAccountAddressesForChain(accounts, valenceDomain, chain)).flat();
  
  await sumTokens({
      api,
      owners: allAccountAddressesForChain,
      chain
      })

      console.log('BALANCES',chain,api.getBalances())
}

/***
 * TVL for liquidity pools deployed with Valence Programs
 */
async function getLpTvl(api,chain) {
  const balances = api.getBalances();

  // only widely used DEX is Astroport on Neutron, more can be added here later on
  const ASTROPORT_REGEX=":astroport:share"
  const astroportLpTokens = Object.keys(balances).filter((address)=>address.match(ASTROPORT_REGEX));

  for (const lpToken of astroportLpTokens) {
    const lpBalance = balances[lpToken];
    const poolAddress = lpToken.replace(":astroport:share","").replace(`${chain}:factory:`,"");
    console.log('POOL ADDRESS',poolAddress,lpToken)


    const shareValue = await queryContract({
      contract: poolAddress,
      chain: "neutron",
      data: `{"share":{"amount":"${lpBalance}"}}`,
    });
    shareValue.forEach((token) => {
      const denom = token.info.native_token.denom;
      const amount = token.amount;
      api.add(denom, amount);
    });

}
}

// TVL for first version of Valance Protocol
async function getV1CovenantsTvl(api) {
  for (const pooler of CONFIG.V1_COVENANTS_POOLER_ADDRESSES) {
    let lpBalance;
    let poolAddress;

    const lpConfig = await queryContract({
      contract: pooler.address,
      chain: "neutron",
      data: '{"lp_config":{}}',
    });

    poolAddress = lpConfig.pool_address;

    const poolInfo = await queryContract({
      contract: poolAddress,
      chain: "neutron",
      data: '{"pair":{}}',
    });

    // Get LP token balance for staked pooler
    if (pooler.staked) {
      lpBalance = await queryContract({
        contract: poolInfo.liquidity_token,
        chain: "neutron",
        data: `{"balance":{"address":"${pooler.address}"}}`,
      });

      lpBalance = lpBalance.balance || 0;
    } else {
      const balanceData = await queryV1Beta1({
        url: `bank/v1beta1/balances/${pooler.address}`,
        chain: "neutron",
      });
      lpBalance = balanceData.balances.find((balance) => balance.denom === poolInfo.liquidity_token)?.amount || 0;
    }

    const shareValue = await queryContract({
      contract: poolAddress,
      chain: "neutron",
      data: `{"share":{"amount":"${lpBalance}"}}`,
    });

    shareValue.forEach((token) => {
      const denom = token.info.native_token.denom;
      const amount = token.amount;
      api.add(denom, amount);
    });
  }
}



module.exports = {
  methodology: "Queries accounts in all Valence programs, including liquidity pools, to sum up total held value.",
  neutron: {
    tvl: async (api) => {
      // await getV1CovenantsTvl(api);
      await getValenceAccountTvl(api, "CosmosCosmwasm", "neutron");
      await getLpTvl(api,"neutron");
    },
  },
  // terra2: {
  //   tvl: (api) => getValenceAccountTvl(api, "CosmosCosmwasm", "terra2"), 
  // }
};

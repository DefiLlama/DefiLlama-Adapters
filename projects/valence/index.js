const { queryContract, queryV1Beta1,sumTokens } = require("../helper/chain/cosmos");
const { queryValencePrograms,extractAccountsFromProgramConfig } = require("../helper/valence");
const { getCache, setCache } = require('../helper/cache')


const VALENCE_ADDRESSES = {
  // contract storing all deployed Valence Programs
  VALANCE_PROTOCOL_REGISTRY_ADDRESS: "neutron1d8me7p72yq95sqnq5jpk34nn4t2vdl30yff29r05250ef92mr80saqcl2f",
  // addresses for pools from early version of Valance Protocol
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

// Configurations for querying value for liquidity tokens for specific DEXs
const DEX_CONFIGS = {
  astroport: {
    // regex to match liquidity tokens  
    regex: ":astroport:share",
    // function to extract pool address from liquidity token address
    poolAddressExtractor: (lpToken, chain) => lpToken.replace(`${chain}:factory:`,"").replace(":astroport:share",""),
    // function to query value of liquidity token
    // returns {amount: number, denom: string}
    queryShareValue: async ({
      poolAddress,
      lpBalance,
      chain
    }) => {
      const shareValue = await queryContract({
        contract: poolAddress,
        chain,
        data: `{"share":{"amount":"${lpBalance}"}}`,
      });
      return shareValue.map((token) => ({
        amount: token.amount,
        denom: token.info.native_token.denom,
      }))
    }
  },
  // Add more DEX configurations here as needed
};

/***
 * Value of tokens being held in Valence accounts
 */
async function getValenceAccountTvl(api, valenceDomain,chain) {
 
  let cache = await getCache('valence','accounts')
  let allProgramAccounts = cache.allProgramAccounts

  if (!cache.allProgramAccounts) {
    // fetch all program configs from the registry contract
    const allProgramConfigs = await queryValencePrograms(VALENCE_ADDRESSES.VALANCE_PROTOCOL_REGISTRY_ADDRESS);
    // extract all account addresses from the program configs
    allProgramAccounts = allProgramConfigs.map((program)=>{
       return Object.values(program.program_config.accounts) 
    })
    await setCache('valence','accounts',{allProgramAccounts})
  }

  // filter accounts by chain
  const allAccountAddressesForChain = allProgramAccounts.map((accounts)=>extractAccountsFromProgramConfig(accounts, valenceDomain, chain)).flat();
  
  return sumTokens({
      api,
      owners: allAccountAddressesForChain,
      chain
      })
}

/***
 * TVL for liquidity pools deployed with Valence Programs
 */
async function getLpTvl(api, chain, dexNames=[]) {
  const balances = api.getBalances();

  for (const dexName of dexNames) {
    const dexConfig = DEX_CONFIGS[dexName];
    if (!dexConfig) {
      console.log(`Warning: skipping unsupported DEX: ${dexName}`);
      continue;
    }

    const possibleLpTokens = Object.keys(balances).filter((address) => address.match(dexConfig.regex));

    possibleLpTokens.forEach(async(lpToken)=>{
         // regex method does not guarantee an LP token is valid, so handle the error gracefully and ignore the asset in the valuation if this is the case
         try {
          const lpBalance = balances[lpToken];
          const poolAddress = dexConfig.poolAddressExtractor(lpToken, chain);
          const shareValues = await dexConfig.queryShareValue({
            poolAddress,
            lpBalance,
            chain
          });
    
          shareValues.forEach((shareValue) => {
            api.add(shareValue.denom, shareValue.amount);
          });
  
        } catch (e){
          console.log('Warning: Could not query LP share value for',lpToken)
        }
    })
  

   
  }
}

// TVL for first version of Valance Protocol
async function getV1CovenantsTvl(api) {
  for (const pooler of VALENCE_ADDRESSES.V1_COVENANTS_POOLER_ADDRESSES) {
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
  methodology: "Aggregates balances in all Valence Programs and converts LP shares to sum up total value.",
  neutron: {
    tvl: async (api) => {
      await getV1CovenantsTvl(api);
      await getValenceAccountTvl(api, "CosmosCosmwasm", "neutron");
      await getLpTvl(api,"neutron",["astroport"]); // this must be called after getValenceAccountTvl, it assumes api.balances has been populated
    },
  },
  terra2: {
    tvl: (api) => getValenceAccountTvl(api, "CosmosCosmwasm", "terra2"), 
  },
  hallmarks: [
    [1717545600, "Nolus<>Neutron liquidity lending"],
    [1718064000, "Stargaze<>Neutron liquidity lending"],
    [1719360000, "Shade<>Neutron liquidity lending"],
    [1723507200, "Mars<>Neutron liquidity lending"],
    [1743379200, "Neutron dICS deployment"]
  ]
};

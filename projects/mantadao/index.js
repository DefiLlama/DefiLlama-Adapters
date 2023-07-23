const { getConfig } = require("../helper/cache");
const { sumTokens, queryContract, queryV1Beta1, getDenomBalance, getBalance2 } = require('../helper/chain/cosmos');
const sdk = require('@defillama/sdk')
const axios = require('axios');

async function tvl() {
    const owners = ["kujira15e682nq9jees29rm9j3h030af86lq2qtlejgphlspzqcvs9whf2q00nua5"];

    // Get base balances of DAO treasury
    const balances =  await sumTokens({ 
      owners: owners, 
      chain: 'kujira' 
    });

    // Get value of DAOs Protocol-Owned-Liquidity
    const POL = await calcPOLValue();

    // Format proper denoms
    const lpPositionValues = await Promise.all(
        POL.map(async (lpPosition) => {
        const value = await sumTokens({
            balances: lpPosition,
            chain: 'kujira'
        })
        return value
    }));

    // Merge duplicate balances

    lpPositionValues.forEach((lpPosition) => {
        sdk.util.mergeBalances(balances, lpPosition)
    });


    return balances;
}

async function calcPOLValue() {
    const treasury = ["kujira15e682nq9jees29rm9j3h030af86lq2qtlejgphlspzqcvs9whf2q00nua5"]

    // Get list of all BOW LP Pools
    const contracts = await getConfig("kujira/contracts", "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json");
    const bowPools = contracts["kaiyo-1"].bow.map(x => x.address)

    // Get list of total supply of all native denoms
    let supplyData = await queryV1Beta1({
            chain: 'kujira',
            url: '/bank/v1beta1/supply'
        });
    
    let denomSupply = supplyData.supply;
    let paginationKey = supplyData.pagination.next_key;

    while(paginationKey){
        supplyData = await queryV1Beta1({
            chain: 'kujira',
            paginationKey: paginationKey,
            url: '/bank/v1beta1/supply'
        });
        denomSupply = denomSupply.concat(supplyData.supply);
        paginationKey = supplyData.pagination.next_key;
    }

    // Get all balances of treasury
    const treasuryBalances = await getBalance2({
        owner: treasury,
        block: undefined,
        chain: 'kujira'
    })
    
    // Calculate outputs of each LP balance
    let treasuryLPDenomBalances = await Promise.all(
        bowPools.map(async (pool) => {
            const lpDenom = `factory/${pool}/ulp`;

            if(treasuryBalances.hasOwnProperty(lpDenom)){
            
                const lpDenomSupply = denomSupply.find((supply) => {
                    return supply.denom == lpDenom;
                })

                
                if(lpDenomSupply){
                    const supply = lpDenomSupply.amount;

                    const poolQuery = JSON.stringify(
                        {
                            pool: {}
                        }
                    );

                    let poolBalances;

                        poolBalances = await queryPoolContract({
                            contract: pool,
                            chain: 'kujira',
                            data: poolQuery
                        });
                    
                        const balances = poolBalances.balances;
                        const coin0OutRatio = parseInt(balances[0]) / parseInt(supply);
                        const coin1OutRatio = parseInt(balances[1]) / parseInt(supply);

                        const treasuryLPBalance = treasuryBalances[lpDenom];

        
                        const coin0Out = coin0OutRatio * treasuryLPBalance;
                        const coin1Out = coin1OutRatio * treasuryLPBalance;

                        const configQuery = JSON.stringify({
                            config: {}
                        })

                        const poolConfig = await queryContract({
                            contract: pool,
                            chain: 'kujira',
                            data: configQuery
                        });


                        const denom0 = poolConfig.denoms[0];
                        const denom1 = poolConfig.denoms[1];

                        const LPBalances = {};
                        LPBalances[denom0] = `${parseInt(coin0Out)}`;
                        LPBalances[denom1] = `${parseInt(coin1Out)}`;
                        return LPBalances;

                

                }

            }


            

        })
    );

    treasuryLPDenomBalances = treasuryLPDenomBalances.filter(Boolean);

    return treasuryLPDenomBalances;

}


// Need hardcoded endpoint as half the suggested ones don't support proper gas limit for Kujira
async function queryPoolContract({ contract, chain, data }) {
    if (typeof data !== "string") data = JSON.stringify(data);
    data = Buffer.from(data).toString("base64");
    return (
      await axios.get(
        `https://kuji-api.kleomedes.network/cosmwasm/wasm/v1/contract/${contract}/smart/${data}`
      )
    ).data.data;
  }


module.exports = {
  timetravel: false,
  kujira: {
    tvl
  },
}


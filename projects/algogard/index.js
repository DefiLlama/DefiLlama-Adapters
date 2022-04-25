const algosdk = require("algosdk")
const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('../helper/balances')

const gardPriceValidatorId = 684650147
const algoPriceOracleId = 673925841

const localStateStrings = {
    gardDebt : "GARD_DEBT",
    unixStart : "UNIX_START",
    externalApps : "EXTERNAL_APPCOUNT"
}

const assetDictionary = {
    "ALGO": {
        "decimals": 6,
    },
    "GARD": {
        "decimals": 6,
        "id": 684649988
    },
    "GAIN": {
        "decimals": 8,
        "id": 684649672
    }
}

async function gardBorrowed() {
    let client = new algosdk.Indexer("", "https://algoindexer.algoexplorerapi.io/", "")
    let nexttoken = ""
    let repsonse = null
    borrow = 0
    do {
        // Find accounts that are opted into the GARD price validator application
        // These accounts correspond to CDP opened on the GARD protocol
       response = await client.searchAccounts()
        .applicationID(gardPriceValidatorId)
        .limit(1000)
        .nextToken(nexttoken).do();
        for (const account of response['accounts']) {

            user_local_state = account["apps-local-state"]
            
            for( const  app_local_state of user_local_state )
            {
                if( app_local_state["id"] == gardPriceValidatorId )
                {
                    key_vals = app_local_state["key-value"]
                      
                    if( key_vals)
                    {
                        for (const x of key_vals) {
                            let decodedKey = Buffer.from(x.key, 'base64').toString('binary')
                            if (decodedKey === localStateStrings.gardDebt ) {
                                borrow += ( x.value.uint / Math.pow(10,assetDictionary['GARD'].decimals))
                            }
                       }
                    }                   
                }
            }            
        }
        nexttoken = response['next-token']
    } while( nexttoken != null );

    // The value of GARD by design of the protocol is 1 USD.  Maybe should consider 
    // getting prices from DEX on Algorand.

    return toUSDTBalances( borrow )
}

async function getAlgoSupplied( client ) {
    let nexttoken = ""
    let repsonse = null
    supply = 0
    do {
        // Find accounts that are opted into the GARD price validator application
        // These accounts correspond to CDP opened on the GARD protocol
       response = await client.searchAccounts()
        .applicationID(gardPriceValidatorId)
        .limit(1000)
        .nextToken(nexttoken).do();
        for (const account of response['accounts']) {
            supply += (account['amount']/ Math.pow(10,assetDictionary['ALGO'].decimals))
        }
        nexttoken = response['next-token']
    } while( nexttoken != null );
  
    return supply
}

async function tvl() {
    let client = new algosdk.Indexer("", "https://algoindexer.algoexplorerapi.io/", "")
    let repsonse = null
    let oracleResults = {}
    
    let supply = await getAlgoSupplied( client )
    
    // Get ALGO price in USD from the block chaain
    response = await client.lookupApplications(algoPriceOracleId).do();   
    response.application.params["global-state"].forEach(x => {
      let decodedKey =  Buffer.from(x.key, 'base64').toString('binary')
      oracleResults[decodedKey] = x.value.uint
    })
    algoUSD =  oracleResults['price'] / Math.pow(10,oracleResults['decimals'])

    supplyUSD = supply * algoUSD

    return toUSDTBalances(supplyUSD)
}

module.exports = {
    algorand: {
        tvl: tvl
    }
};

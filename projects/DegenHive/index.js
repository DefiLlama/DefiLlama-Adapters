const sui = require("../helper/chain/sui");
const { GraphQLClient } = require("graphql-request");
const { SuiClient } = require("@mysten/sui.js/client");
const {TransactionBlock} = require("@mysten/sui.js/transactions");
  
const graphQLClientMainnet = new GraphQLClient(
    "https://5lox8etck8.execute-api.eu-central-1.amazonaws.com/api/v1"
  );

const GET_SUI_POOLS = `query GetSuiPools {
  getSuiPools {
    pools {
      poolId
    }
  }
}`

const GET_SUI_MEME_POOLS = `query GetSuiMemePools {
  getSuiMemePools {
    pools {
      meme_pool_addr
    }
  }
}`

/// Helper function to deserialize uint64 from a byte array
function deserializeUint64(bytes) {
    if (bytes.length !== 8) {
        throw new Error("Expected 8 bytes for uint64 deserialization");
    }

    // Convert little-endian byte array to uint64
    let result = 0n; // BigInt to handle large numbers
    for (let i = 0; i < 8; i++) {
        result |= BigInt(bytes[i]) << BigInt(8 * i);
    }

    return result;
}

/// Query to get the total SUI staked in the liquid staking object
async function get_total_sui() {
    const suiClient = new SuiClient({   url: "https://fullnode.mainnet.sui.io:443/" });
    const txb = new TransactionBlock();
    txb.moveCall({
      target: `0x53578180d93e5fa7b10334045c4565e3c743f0eb64c89932b14adb1b0baab145::dsui_vault::get_total_sui`,
      typeArguments: [],
      arguments: [txb.object("0x85aaf87a770b4a09822e7ca3de7f9424a4f58688cfa120f55b294a98d599d402")],
    });
    // Simulate tx
    let resp = await suiClient.devInspectTransactionBlock({
      transactionBlock: txb,
      sender: "0x5ecf33555da8087dd2edb039b6a21bed3f38696a199bfce5f72e4389c28292d0",
    });
  
    console.log(resp.results[0].returnValues[0][0])
    let total_sui_staked = deserializeUint64(resp.results[0].returnValues[0][0]);
    total_sui_staked = Number(total_sui_staked) / 10 ** 9
    console.log("total_sui_staked", total_sui_staked)

    return total_sui_staked
}

async function tvl(api) {
    const sui_pools = await graphQLClientMainnet.request(GET_SUI_POOLS, {})
    const sui_meme_pools = await graphQLClientMainnet.request(GET_SUI_MEME_POOLS, {})

    // Extract arrays of pool IDs
    const poolIds = sui_pools.getSuiPools.pools.map(pool => pool.poolId);
    const memePoolAddrs = sui_meme_pools.getSuiMemePools.pools.map(pool => pool.meme_pool_addr);

    const suiPoolsData = await sui.getObjects(poolIds)
    const suiMemePoolsData = await sui.getObjects(memePoolAddrs)

    // Add TVL for AMM Pools 
    for (const { type, fields } of suiPoolsData) {
        if ( fields.coin_x_reserve == 0 && fields.coin_y_reserve == 0) continue;
        let coin_x_type = type.split('<')[1].split(',')[0].trim()
        let coin_y_type = type.split('<')[1].split(',')[1].trim()
        
        api.add(  coin_x_type, fields.coin_x_reserve / 10 ** fields.coin_x_decimals)
        api.add( coin_y_type, fields.coin_y_reserve / 10 ** fields.coin_y_decimals)

        if (fields.coin_z_reserve && fields.coin_z_reserve > 0) {
            let coin_z_type = type.split('<')[1].split(',')[2].trim()
            api.add( coin_z_type, fields.coin_z_reserve / 10 ** fields.coin_z_decimals)
        }
    }

    // Add TVL for MEME Pools 
    for (const { fields } of suiMemePoolsData) {
        if ( fields.sui_available == 0) continue;
        api.add( "0x2::sui::SUI", fields.sui_available / 10 ** 9) 
    }

    // Add TVL from SUI liquid staking
    const sui_liquid_staking_pools = await get_total_sui()
    api.add( "0x2::sui::SUI", sui_liquid_staking_pools) 

}
 
  
module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
  methodology: "TVL consists of the liquidity in the AMM pools, SUI present in Meme coin launchpad pools, and the SUI staked in the liquid staking pools."
};

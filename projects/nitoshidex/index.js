const client = require("@cosmjs/cosmwasm-stargate");
const cosmWasmClient = client.CosmWasmClient;

const FACTORY = "nibi1p94l042clmh2hdlmz4ugqgqk64er7n3af45c8tyh0nvj40ueaewq9uqwtn";
const RPC_ENDPOINT = "https://rpc.nibiru.fi:443";

const tvl = async (_, _1, _2, { api })=> {

  let client = await cosmWasmClient.connect(RPC_ENDPOINT);

  const configQuery = await client?.queryContractSmart(
    FACTORY,
    {
      config: {}
    }
  );

  let volume = 0;

  let pairsCreated = configQuery['pools_created'];

  for (let i = 0; i < pairsCreated; i++) {
    const pair = await client?.queryContractSmart(
      FACTORY,
      {
        pairs_by_index: {
          index:i.toString()
        }
      }
    );

    let matched = false;

    pair.assets.map((value)=>{
      if (value.hasOwnProperty("native_token")) {
        matched = true;
      }
    });

    if (matched == true) {
      const trading_volume = await client?.queryContractSmart(
        pair.pair_addr,
        {
          pool_info:{}
        }
      );
      
      if (pair.assets[0].hasOwnProperty("native_token")) {
        volume += Number(trading_volume.trading_volume[0]);
      }
      else if (pair.assets[1].hasOwnProperty("native_token")) {
        volume += Number(trading_volume.trading_volume[1]);
      }
    }

  }

  api.add("nibiru", volume);
  
}

module.exports = {
  nibiru: {
    tvl
  },
  timetravel: false,
  start: 1713592724,
  misrepresentedTokens: false,
  methodology:"Gets the total volume of Nibiru tokens traded on the Nitosi DEX AMM"
}
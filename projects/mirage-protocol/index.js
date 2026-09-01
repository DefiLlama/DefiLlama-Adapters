const ADDRESSES = require('../helper/coreAssets.json')
const { function_view } = require("../helper/chain/aptos");

const MIRAGE_MOVEMENT =
  "0x24d6dcce95555b8e8eeaed7d739ea1036c0b8d4bbc6a01797505295a56d322cc";

const MIRAGE_APTOS = 
  "0x24d6dcce95555b8e8eeaed7d739ea1036c0b8d4bbc6a01797505295a56d322cc"

const MOVEMENT_MOVE_MUSD_POOL = "0x81821b61b14a7899e6417c9f9b6a2a8871d6d27a2fc66fee97942425185d546f";

const APTOS_APT_MUSD_POOL = "0xe1e13aa968df88dff6ac5227eaa6220c90a0e40e60ce274695a134f43966e2c0";
const APTOS_USDC_MUSD_POOL = "0x3fb56c8c18ad3f20acf1ac971edfca4dd2bef1144e363aec83a04587675752f5";

const APTOS_USDC_FA = ADDRESSES.aptos.USDC_3

async function tvl(api) {
  const chain = api.chain;

  if (chain === 'move') {
    const moveResponse = await function_view({
      functionStr: `${MIRAGE_MOVEMENT}::vault::total_collateral`,
      args: [MOVEMENT_MOVE_MUSD_POOL],
      chain: 'move'
    })
    api.add("0xa", moveResponse)
  } else if (chain === 'aptos') {
    const aptResponse = await function_view({
      functionStr: `${MIRAGE_APTOS}::vault::total_collateral`,
      args: [APTOS_APT_MUSD_POOL],
      chain: 'aptos'
    })
    api.add("0xa", aptResponse)

    const usdcResponse = await function_view({
      functionStr: `${MIRAGE_APTOS}::vault::total_collateral`,
      args: [APTOS_USDC_MUSD_POOL],
      chain: 'aptos'
    })
    api.add(APTOS_USDC_FA, usdcResponse)
  }
}

module.exports = {
  timetravel: false,
  move: { tvl },
  aptos: { tvl }
};


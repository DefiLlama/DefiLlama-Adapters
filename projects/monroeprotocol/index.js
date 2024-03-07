const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const { getLogs } = require('../helper/cache/getLogs')

// Controllers[chain]
const CONTROLLERS = {
  manta: "0xCc396B83Baba70c85FBB8f44B64e7e43aE810232",
}


async function tvl(_, _1, _2, { api }) {
  const logs = await getLogs({ 
    api, 
    target: CONTROLLERS[api.chain], 
    eventAbi: "event CreatedSynth(address newSynth, string name, address oracle)",
    onlyArgs: true,
    fromBlock: 1548740
  });
  const synthAddresses = logs.map(log => log.newSynth);
  
  const vaultLength = await api.call({
    abi: "uint:getVaultsLength",
    target: CONTROLLERS[api.chain]
  })

  let tokens = await Promise.all(synthAddresses.map( async (synth) => {
    let mintVaults = await Promise.all([...new Array(vaultLength)].map(async(_, vaultIndex) => {return await 
      api.call({
        abi: "function mintVaults(uint vaultId) view returns (address)",
        target: synth,
        params: vaultIndex
      })
    }))
    let collateralAmounts = await Promise.all(
      mintVaults.map(async vaultAddress => {
        let collateralAddress = await api.call({
          abi: "function collateralAsset() view returns (address)",
          target: vaultAddress
        })
        let amount = await api.call({
          abi: "function balanceOf(address user) view returns (uint)",
          target: collateralAddress,
          params: vaultAddress
        })
        return [collateralAddress, amount]
      })
    )
    return collateralAmounts
  }))
  for (let synthCollateralAmounts of tokens){
    for(let collateralAmounts of synthCollateralAmounts){
      api.add(collateralAmounts[0], collateralAmounts[1])
    }
  }
}



module.exports = {
  methodology:
    "Adds up the total value locked as collateral in Monroe vaults",
  start: 1709510400, // Monday, March 4, 2024 00:00 GMT
};

Object.keys(CONTROLLERS).forEach((chain) => {
  module.exports[chain] = { tvl };
});

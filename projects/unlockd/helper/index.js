const sdk = require("@defillama/sdk");
const abi = require("./abi/abi"); 
const address = require("./addresses");
const chain = 'ethereum'

async function tvl(chain, timestamp, chainBlocks, { api }) {
  const balances = {}

  try {
    const reservesData = await api.call({
      target: address.ethereum.UiPoolDataProvider,
      params: [address.ethereum.LendPoolAddressProvider],
      abi: abi.UiPoolDataProvider.getSimpleReservesData,
    })

    reservesData.forEach(reserve => {
      sdk.util.sumSingleBalance(
        balances, 
        reserve.underlyingAsset, 
        reserve.availableLiquidity, 
        api.chain
      )
    });

    console.log(reservesData)
    return balances;
  } catch(err) {
    throw new Error("Error getting reserves data", err)
  }
}

async function borrowed(chain, timestamp, chainBlocks, { api }) {
  const balances = {}

  try {
    const reservesData = await 
      api.call({
        target: address.ethereum.UiPoolDataProvider,
        params: [address.ethereum.LendPoolAddressProvider],
        abi: abi.UiPoolDataProvider.getSimpleReservesData
      })
      
    reservesData.map(
      reserve => sdk.util.sumSingleBalance(
        balances, 
        reserve.underlyingAsset, 
        reserve.totalVariableDebt, 
        api.chain
      )
    )

    return balances;
  }  
  catch(err) {
    throw new Error("Error getting reserves data", err)
  }
}

module.exports = {
  tvl,
  borrowed,
};



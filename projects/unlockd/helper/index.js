const sdk = require("@defillama/sdk");
const abi = require("./abi/abi"); 
const address = require("./addresses");
const { sumTokens2 } = require("../../helper/unwrapLPs") 
const BN = require('bignumber.js');

async function tvl(chain, timestamp, chainBlocks, { api }) {

    const [reservesData, uNFTAssetList] = await Promise.all([ 
      api.call({
        target: address.ethereum.UiPoolDataProvider,
        params: [address.ethereum.LendPoolAddressProvider],
        abi: abi.UiPoolDataProvider.getSimpleReservesData,
      }),
      api.call({
        target: address.ethereum.UNFTRegistry,
        abi: abi.UNFTRegistry.getUNFTAssetList,
      }),
    ]);

    const balances = await sumTokens2({ api, tokensAndOwners: address.uTokens });

    reservesData.forEach(reserve => {
      const availableLiquidity = new BN(reserve.availableLiquidity);
      const totalVariableDebt = new BN(reserve.totalVariableDebt);
      const sum = availableLiquidity.plus(totalVariableDebt);

      sdk.util.sumSingleBalance(
        balances, 
        reserve.underlyingAsset, 
        sum.toFixed(), 
        api.chain
      )
    });
}

async function borrowed(chain, timestamp, chainBlocks, { api }) {
  const balances = {}

    const [reservesData] = await Promise.all([
      api.call({
        target: address.ethereum.UiPoolDataProvider,
        params: [address.ethereum.LendPoolAddressProvider],
        abi: abi.UiPoolDataProvider.getSimpleReservesData
      })
    ]);
      
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

module.exports = {
  tvl,
  borrowed,
};



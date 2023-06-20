const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const chain = 'arbitrum';
const abi = 'uint256:totalUSDvaults'
const vault = "0xA7Ce4434A29549864a46fcE8662fD671c06BA49a";
const vault2 = "0x8080B5cE6dfb49a6B86370d6982B3e2A86FBBb08";
const stakingAdd = "0x48c81451d1fddeca84b47ff86f91708fa5c32e93";
// const EsGMDAddress = "0x49E050dF648E9477c7545fE1779B940f879B787A";
const GMDaddress = "0x4945970EfeEc98D393b4b979b9bE265A3aE28A8B";

const Tvl = async (ts, _, { arbitrum: block }) => {
  const balances = {};
  const bals = await sdk.api2.abi.multiCall({
    abi, calls: [vault, vault2], chain, block,
  })

  bals.forEach(i =>sdk.util.sumSingleBalance(balances, 'tether', i/1e18, 'coingecko'))
  return balances
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "staked gmd + vault balance",
  arbitrum: {
    staking: staking(stakingAdd, GMDaddress, "arbitrum"),
    tvl: Tvl,
  },
};




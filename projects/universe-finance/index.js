const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");

const vaultsUrl = "https://raw.githubusercontent.com/UniverseFinance/UniverseFinanceProtocol/main/doc/vaultAddress.json";


const token0Abi = require("../helper/abis/token0.json");
const token1Abi = require("../helper/abis/token1.json");

async function tvl(timestamp, block) {
  let balances = {};

  let resp = await utils.fetchURL(vaultsUrl);

  let allVaults = resp.data.filter(vault => vault.type > 0).map((vault) => ({
        address: vault.address,
        name: vault.name,
        getTotalAmounts: vault.getTotalAmounts,
        type: vault.type,
        amountIndex: vault.amountIndex
  }));

  const abiMap = {};
  const addressMap = {};

  for (let i = 0; i < allVaults.length; i++) {
      if(abiMap[allVaults[i].type] == undefined){
          abiMap[allVaults[i].type] = allVaults[i].getTotalAmounts;
      }
      if(addressMap[allVaults[i].type] == undefined){
          addressMap[allVaults[i].type] = [{
              "address":allVaults[i].address,
              "index":allVaults[i].amountIndex
          }];
      }else{
          addressMap[allVaults[i].type].push({
              "address":allVaults[i].address,
              "index":allVaults[i].amountIndex
          });
      }
  }
  const types = Object.keys(abiMap);
  const typeNumber = types.length;
  for (let i = 0; i < typeNumber; i++) {
      const addressList = addressMap[types[i]];
      const abi = abiMap[types[i]];
      let { output: totalAmount } = await sdk.api.abi.multiCall({
        calls: addressList.map((address) => ({
          target: address.address,
        })),
        abi: abi,
        block,
      });

      let { output: token0 } = await sdk.api.abi.multiCall({
        calls: addressList.map((address) => ({
          target: address.address,
        })),
        abi: token0Abi,
        block,
      });

      let { output: token1 } = await sdk.api.abi.multiCall({
        calls: addressList.map((address) => ({
          target: address.address,
        })),
        abi: token1Abi,
        block,
      });

      for (let i = 0; i < addressList.length; i++) {
        // Sums value in UNI pools
        sdk.util.sumSingleBalance(balances, token0[i].output, totalAmount[i].output[addressList[i].index]);
        sdk.util.sumSingleBalance(balances, token1[i].output, totalAmount[i].output[addressList[i].index + 1]);
      }
  }

  return balances;
}

module.exports = {
  methodology: "Vault TVL consists of the tokens in the vault contract and the total amount in the UNI V3 pool through the getTotalAmounts ABI call",
  ethereum: {
    tvl,
  },
  tvl,
};

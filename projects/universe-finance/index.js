const sdk = require("@defillama/sdk");
const { getConfig } = require('../helper/cache')

const vaultsUrl = "https://raw.githubusercontent.com/UniverseFinance/UniverseFinanceProtocol/main/doc/vaultAddress.json";

const token0Abi = 'address:token0'
const token1Abi = 'address:token1'

function eth(timestamp, ethBlock, chainBlocks) {
    return chainTvl(timestamp, ethBlock, chainBlocks, "ethereum");
}

function matic(timestamp, ethBlock, chainBlocks) {
    return chainTvl(timestamp, ethBlock, chainBlocks, "polygon");
}


async function chainTvl(timestamp, ethBlock, chainBlocks, chain) {
  const block = chain == "ethereum" ? ethBlock : chainBlocks[chain];
  let balances = {};
  let resp = await getConfig('Universe', vaultsUrl);

  let allVaults = resp.filter(vault => vault.type > 0).map((vault) => ({
        address: vault.address,
        name: vault.name,
        getTotalAmounts: vault.getTotalAmounts,
        type: vault.type,
        amountIndex: vault.amountIndex,
        chain: vault.chain
  }));

  const abiMap = {};
  const addressMap = {};

  for (let i = 0; i < allVaults.length; i++) {
      if(allVaults[i].chain != chain){
           continue;
      }
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
        chain
      });

      let { output: token0 } = await sdk.api.abi.multiCall({
        calls: addressList.map((address) => ({
          target: address.address,
        })),
        abi: token0Abi,
        block,
        chain
      });

      let { output: token1 } = await sdk.api.abi.multiCall({
        calls: addressList.map((address) => ({
          target: address.address,
        })),
        abi: token1Abi,
        block,
        chain
      });

      for (let i = 0; i < addressList.length; i++) {
        let addr0 = token0[i].output;
        addr0 = (chain == "ethereum" ? addr0 : (chain + ":" + addr0));
        let addr1 = token1[i].output;
        addr1 = (chain == "ethereum" ? addr1 : (chain + ":" + addr1));
        // Sums value in UNI pools
        sdk.util.sumSingleBalance(balances, addr0, totalAmount[i].output[addressList[i].index]);
        sdk.util.sumSingleBalance(balances, addr1, totalAmount[i].output[addressList[i].index + 1]);
      }
  }

  return balances;
}

module.exports = {
  doublecounted: true,
  methodology: "Vault TVL consists of the tokens in the vault contract and the total amount in the UNI V3 pool through the getTotalAmounts ABI call",
  ethereum: {
    tvl: eth,
  },
  polygon: {
    tvl: matic
  },
};

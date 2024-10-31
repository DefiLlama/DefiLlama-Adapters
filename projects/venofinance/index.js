const { staking } = require("../helper/staking.js");

const fountain_contract_address = "0xb4be51216f4926ab09ddf4e64bc20f499fd6ca95";
const reservoir_contract_address = "0x21179329c1dcfd36ffe0862cca2c7e85538cca07";
const vno_contract_address = "0xdb7d0a1ec37de1de924f8e8adac6ed338d4404e9";
const zkCRO_contract_address = "0x28Ff2E4dD1B58efEB0fC138602A28D5aE81e44e2";
const ybETH_contract_address = "0x76bf2D1e6dFda645c0c17440B17Eccc181dfC351";
const ybUSD_contract_address = "0xFA59075DfCE274E028b58BdDFcC3D709960F594a";
const vETH_contract_address = "0x271602A97027ee1dd03b1E6e5dB153eB659A80b1";
const vUSD_contract_address = "0x5b91e29Ae5A71d9052620Acb813d5aC25eC7a4A2";


async function tvlCronos(api) {
  const lcro_contract_address = "0x9Fae23A2700FEeCd5b93e43fDBc03c76AA7C08A6";
  const latom_contract_address = "0xac974ee7fc5d083112c809ccb3fce4a4f385750d";

  const cro_pooled = await api.call({ abi: "uint256:getTotalPooledCro", target: lcro_contract_address, })
  const atom_pooled = await api.call({ abi: "uint256:getTotalPooledToken", target: latom_contract_address, })

  api.addGasToken(cro_pooled)
  api.addCGToken('cosmos', atom_pooled / 1e6)
  return api.getBalances()
}

async function tvlEra(api) {
  const leth_contract_address = "0xE7895ed01a1a6AAcF1c2E955aF14E7cf612E7F9d";

  const eth_pooled = await api.call({ abi: "uint256:getTotalPooledToken", target: leth_contract_address, })
  api.addGasToken(eth_pooled)
  return api.getBalances()
}

async function tvlEthereum(api) {
  const cro_pooled = await api.call({ abi: "uint256:totalPooledCro", target: zkCRO_contract_address });
  api.addCGToken('crypto-com-chain', cro_pooled / 1e8);
  const eth_pooled = await api.call({ abi: "uint256:totalPooledEth", target: ybETH_contract_address });
  api.addCGToken('ethereum', eth_pooled / 1e18);  
  const usd_pooled = await api.call({ abi: "uint256:totalUsdValue", target: ybUSD_contract_address });
  api.addCGToken('dai', usd_pooled / 1e18); 

  return api.getBalances();
}

async function tvlCronosZkEVM(api) {
  const totalVEth = await api.call({ abi: "uint256:ybEthValue", target: vETH_contract_address });
  api.addCGToken('ethereum', totalVEth / 1e18); 
  const totalVUsd = await api.call({ abi: "uint256:ybUsdValue", target: vUSD_contract_address });
  api.addCGToken('dai', totalVUsd / 1e18);

  return api.getBalances();
}

module.exports = {
  methodology: "TVL counts tokens staked by the protocol.",
  cronos: {
    tvl: tvlCronos,
    staking: staking(
      [fountain_contract_address, reservoir_contract_address],
      vno_contract_address
    ),
  },
  era: {
    tvl: tvlEra,
  },
  ethereum: {
    tvl: tvlEthereum, 
  },
  cronos_zkevm: {
    tvl: tvlCronosZkEVM, 
  },
};

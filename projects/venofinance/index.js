const { staking } = require("../helper/staking.js");
const sdk = require('@defillama/sdk')

const fountain_contract_address = "0xb4be51216f4926ab09ddf4e64bc20f499fd6ca95";
const reservoir_contract_address = "0x21179329c1dcfd36ffe0862cca2c7e85538cca07";
const vno_contract_address = "0xdb7d0a1ec37de1de924f8e8adac6ed338d4404e9";
const zkCRO_contract_address = "0x28Ff2E4dD1B58efEB0fC138602A28D5aE81e44e2";
const vETH_contract_address = "0x271602A97027ee1dd03b1E6e5dB153eB659A80b1";
const vUSD_contract_address = "0x5b91e29Ae5A71d9052620Acb813d5aC25eC7a4A2";
const lcro_contract_address = "0x9fae23a2700feecd5b93e43fdbc03c76aa7c08a6"
const l2_base_token_address = "0x000000000000000000000000000000000000800a"


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


async function tvlCronosZkEVM(zkEvmApi) {
  const ethApi = new sdk.ChainApi({ chain: 'ethereum' });
  const cronosApi = new sdk.ChainApi({ chain: 'cronos' });

  const totalVEth = await zkEvmApi.call({ abi: "uint256:ybEthValue", target: vETH_contract_address });
  zkEvmApi.addCGToken('ethereum', totalVEth / 1e18); 
  const totalVUsd = await zkEvmApi.call({ abi: "uint256:ybUsdValue", target: vUSD_contract_address });
  zkEvmApi.addCGToken('dai', totalVUsd / 1e18);

  const totalZkCro = await zkEvmApi.call({ abi: "uint256:totalSupply", target: l2_base_token_address });
  const croOfZkCroContract = await ethApi.call({
      abi: 'function convertToAsset(uint256 shares) view returns (uint256 assets)',
      target: zkCRO_contract_address,
      params: [`${totalZkCro}`]
    });
  const totalLcro = await cronosApi.call({
    abi: 'function convertToShare(uint256 assets) view returns (uint256 shares)',
    target: lcro_contract_address,
    params: [croOfZkCroContract]
  });

  zkEvmApi.addCGToken('liquid-cro', totalLcro / 1e8);
  return zkEvmApi.getBalances();
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
  cronos_zkevm: {tvl: tvlCronosZkEVM}
};

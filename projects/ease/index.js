const sdk = require('@defillama/sdk');
const axios = require("axios");
const { stakings } = require("../helper/staking");

const VAULT_LIST_URL = 'https://devapi.ease.org/api/v1/vaults';
const EASE = "0xEa5eDef1287AfDF9Eb8A46f9773AbFc10820c61c";
const STAKING_CONTRACTS = [
  //BRIBE_POT
 "0xEA5EdeF17C9be57228389962ba50b98397f1E28C",
  //GV_EASE
  "0xEa5edeF1eDB2f47B9637c029A6aC3b80a7ae1550",
];
const RCA_SHIELD = {
  abis: {
    uBalance: {
      constant: true,
      inputs: [],
      name: "uBalance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  },
};

async function tvl(timestamp, block, chainBlocks) {
  let resp = await axios.get(VAULT_LIST_URL);
  let vaults = resp.data
  const balances = {};

  for(let i = 0; i < vaults.length; i++) {
    let vs = vaults[i];
    const collateralBalance = (await sdk.api.abi.call({
      abi: RCA_SHIELD.abis.uBalance,
      target: vs.address,
      params: [],
      block,
    })).output;
    await sdk.util.sumSingleBalance(balances, vs.token.address, collateralBalance);
  }
  return balances;
}

module.exports = {
  misrepresentedTokens: false,
  //TODO: get exact number
  start: 14000000,
  ethereum:{
    tvl,
    staking: stakings(STAKING_CONTRACTS, EASE),
  },
}; 

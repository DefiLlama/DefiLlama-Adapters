const sdk = require('@defillama/sdk');
const axios = require("axios");

const VAULT_LIST_URL = 'https://devapi.ease.org/api/v1/vaults';

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
    tvl
  },
}; 

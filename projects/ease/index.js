const sdk = require('@defillama/sdk');
const axios = require("axios");
const { default: BigNumber } = require('bignumber.js');
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

async function tvl(_, block) {
  let resp = await axios.get(VAULT_LIST_URL);
  let vaults = resp.data
  const balances = {};
  const { output: bal } = await sdk.api.abi.multiCall({
    abi: RCA_SHIELD.abis.uBalance,
    calls: vaults.map(i => ({ target: i.address })),
    block,
  })
  bal.forEach(({ output}, i) => {
    const { decimals, token, address } = vaults[i]
    const fixDecimals = 10 ** (decimals - token.decimals)
    console.log(token.symbol)
    console.log(token.address)
    sdk.util.sumSingleBalance(balances, token.address, BigNumber( output / fixDecimals).toFixed(0));
  })
  return balances;
}

module.exports = {
  ethereum:{
    tvl,
    staking: stakings(STAKING_CONTRACTS, EASE),
  },
}
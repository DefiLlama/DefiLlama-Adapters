const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const { stakings } = require("../helper/staking");
const { getConfig } = require('../helper/cache')

const VAULT_LIST_URL = 'https://devapi.ease.org/api/v1/vaults';
const EASE = "0xEa5eDef1287AfDF9Eb8A46f9773AbFc10820c61c";
const NXM = "0xd7c49CEE7E9188cCa6AD8FF264C1DA2e69D4Cf3B";
// const ARNXM_VAULT = "0x1337DEF1FC06783D4b03CB8C1Bf3EBf7D0593FC4";
const STAKING_CONTRACTS = [
  //BRIBE_POT
 "0xEA5EdeF17C9be57228389962ba50b98397f1E28C",
  //GV_EASE
  "0xEa5edeF1eDB2f47B9637c029A6aC3b80a7ae1550",
];

const RCA_SHIELD = {
  abis: {
    uBalance:  "uint256:uBalance"
  },
};

const ARNXM_VAULT = {
  abis: {
    aum: "uint256:aum",
  },
  address: "0x1337DEF1FC06783D4b03CB8C1Bf3EBf7D0593FC4",
}

async function tvl(_, block) {
  //get TVL of Uninsurance vaults
  let resp = await getConfig('ease', VAULT_LIST_URL);
  let vaults = resp
  const balances = {};
  const { output: bal } = await sdk.api.abi.multiCall({
    abi: RCA_SHIELD.abis.uBalance,
    calls: vaults.map(i => ({ target: i.address })),
    block,
  })
  bal.forEach(({ output}, i) => {
    const { decimals, token, address } = vaults[i]
    const fixDecimals = 10 ** (decimals - token.decimals)
    sdk.util.sumSingleBalance(balances, token.address, BigNumber( output / fixDecimals).toFixed(0));
  })

  //get TVL of arNXM vault
  const { output: balNXM } = await sdk.api.abi.call({
    target: ARNXM_VAULT.address, 
    abi: ARNXM_VAULT.abis.aum,
    block,
  });
  sdk.util.sumSingleBalance(balances, NXM, balNXM)

  return balances;
}

module.exports = {
  ethereum:{
    tvl,
    staking: stakings(STAKING_CONTRACTS, EASE),
  },
}
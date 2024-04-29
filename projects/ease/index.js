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

async function tvl(api) {
  //get TVL of Uninsurance vaults
  let resp = await getConfig('ease', VAULT_LIST_URL);
  let vaults = resp.map(i => i.address.toLowerCase()).filter(i => i !== '0x8f247eb2d71beeacdf212f8bc748f09cdf7144c0')
  const bals = await api.multiCall({  abi: 'uint256:uBalance', calls: vaults })
  const tokens = await api.multiCall({  abi: 'address:uToken', calls: vaults })
  const decimals = await api.multiCall({  abi: 'erc20:decimals', calls: tokens })
  api.addTokens(tokens, bals.map((v, i) => v / 10 ** (18 - decimals[i])))
  //get TVL of arNXM vault
  const balNXM = await api.call({    target: ARNXM_VAULT.address,     abi: ARNXM_VAULT.abis.aum,  });
  api.add(NXM, balNXM)
}

module.exports = {
  ethereum:{
    tvl,
    staking: stakings(STAKING_CONTRACTS, EASE),
  },
}
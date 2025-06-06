const { sumTokens2 } = require('../helper/unwrapLPs');

const ATV_802_VAULT_CONTRACT = "0xb68e430c56ed9e548e864a68a60f9d41f993b32c";
const ATV_808_VAULT_CONTRACT = "0x60697825812ecC1Fff07f41E2d3f5cf314674Fa6";
const ATV_111_VAULT_CONTRACT = "0xcb1b3bbcccdcf1420dab54c047786086f4a012aa";
const cUSDC = "0x39aa39c021dfbae8fac545936693ac917d5e7563";
const cUSDCv3 = "0xc3d688B66703497DAA19211EEdff47f25384cdc3";
const aETHUSDC = "0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c";

const VAULTS = [
  ATV_802_VAULT_CONTRACT,
  ATV_808_VAULT_CONTRACT,
  ATV_111_VAULT_CONTRACT,
];

const getTokensFromVault = async (api, vault) => {
  const [_, inputTokens] = await api.call({
    abi: 'function getInputToken() view returns (address[], address[])',
    target: vault
  });

  const uTokens = await api.call({
    abi: 'function getUTokens() view returns (address[])',
    target: vault
  });

  return inputTokens.concat(uTokens).concat([cUSDC, cUSDCv3, aETHUSDC]);
};

async function tvl(api) {
  const tokensAndOwners = [];

  for (const vault of VAULTS) {
    const tokens = await getTokensFromVault(api, vault);
    tokens.forEach(token => {
      tokensAndOwners.push([token, vault]);
    });
  }

  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  doublecounted: false,
  methodology: 'TVL is calculated as the value of all input and yield-bearing tokens held in the âtv vault contracts.',
  ethereum: {
    tvl,
  },
};
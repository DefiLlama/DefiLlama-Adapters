const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens, sumTokensExport } = require('../helper/sumTokens.js');

const TST = "0x0828096494ad6252F0F853abFC5b6ec9dfe9fDAd";
const TST_DELEGATION = "0x93AD6C8B3a273E0B4aeeBd6CF03422C885217D3B";

const config = {
  bsc: { teleBTC: '0xC58C1117DA964aEbe91fEF88f6f5703e79bdA574', lockersManager: '0x84F74e97ebab432CeE185d601290cE0A483987A5' },
  polygon: { teleBTC: '0x3bf668fe1ec79a84ca8481cead5dbb30d61cc685', lockersManager: '0xf5D6D369A7F4147F720AEAdd4C4f903aE8046166' },
};

async function tvl(api) {
  const { teleBTC, lockersManager } = config[api.chain];
  const supply = await api.call({ abi: 'erc20:totalSupply', target: teleBTC });
  api.add(teleBTC, supply);
  await sumTokens({ api, owners: [lockersManager], tokens: [ADDRESSES.null] });
}

module.exports = {
  methodology: 'TVL is the total supply of TeleBTC on supported chains. Each TeleBTC is backed 1:1 by BTC on Bitcoin held by TeleSwap nodes (Lockers). Native token collateral locked by Lockers is also counted. TST delegated to Lockers is counted as staking.',
  ethereum: { staking: sumTokensExport({ owners: [TST_DELEGATION], tokens: [TST] }) },
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl };
});
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const WAR_CONTROLLER = "0xFDeac9F9e4a5A7340Ac57B47C67d383fb4f13DBb";
const WAR_REDEEMER = "0x4787Ef084c1d57ED87D58a716d991F8A9CD3828C";
const VAULT_V2 = '0x2fc1E74BC8A6D15fE768c10C2EDe7D6d95ec27e9';
const VAULT = '0x188cA46Aa2c7ae10C14A931512B62991D5901453';
const WAR = '0xa8258deE2a677874a48F5320670A869D74f0cbC1';

async function getLockers(api) {
  let lockers = [];

  for (let i = 0; i != -1; ++i) {
    try {
      const output = await api.call({
        target: WAR_CONTROLLER,
        abi: abi["lockers"],
        params: [i]
      })
      lockers.push(output);
    } catch(e) {
      break;
    }
  }

  return lockers;
}

async function warlordTvl(api, vaultAddress) {
  const balances = {};

  const lockers = await getLockers(api);

  const bals = await api.multiCall({ abi: abi["getCurrentLockedTokens"], calls: lockers.map(i => ({ target: i})) })
  const tokens = await api.multiCall({ abi: abi["token"], calls:  lockers.map(i => ({ target: i})) })
  const tokensQueued = await api.multiCall({ abi: abi["queuedForWithdrawal"], calls: tokens.map(i => ({ target: WAR_REDEEMER, params: [i] })) })

  const totalSupply = await api.call({target: WAR, abi: abi['totalSupply']});
  const vaultBalance = await api.call({ target: vaultAddress, abi: abi['totalAssets']});
  const ratio = vaultBalance / totalSupply;

  bals.forEach((v, i) => {
    sdk.util.sumSingleBalance(balances, tokens[i], (v - tokensQueued[i]) * ratio)
  })

  return balances;
}

async function ethTvl(api,) {
  const v1 = await warlordTvl(api, VAULT)
  const v2 = await warlordTvl(api, VAULT_V2)

  sdk.util.mergeBalances(v1, v2);

  return v1;
}

module.exports = {
  methodology: "Counts the total number of cvx and aura Locked inside Warlord and compare it to the balance of Tholgar Vault",
  ethereum: {
    tvl: ethTvl,
  },
};

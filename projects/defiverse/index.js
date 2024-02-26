const { sumTokens2 } = require('../helper/unwrapLPs')

const VAULT_CONTRACT = "0x2FA699664752B34E90A414A42D62D7A8b2702B85";
const TOKENS = [
  "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2",
  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  "0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea",
  "0x5a89E11Cb554E00c2f51C4bb7F05bc7Ab0Fa6351",
];

async function tvl(_, _b, _cb, { api }) {
  const tokenAddesses = TOKENS.map((x) => x.address);
  return sumTokens2({ api, owner: VAULT_CONTRACT, tokens: TOKENS });
}

module.exports = {
  defiverse: {
    tvl,
  },
};

const lksmToKsm = require("./lksmToKsm.js");
const { getKaruraAPI } = require('../helper/karura')

async function tvl() {
  const api = await getKaruraAPI();

  const ksmLocked = await lksmToKsm(
    api,
    Number(
      await api.query.tokens.totalIssuance({
        Token: "LKSM",
      })
    )
  );

  return {
    kusama: ksmLocked / 1e12,
  };
}

module.exports = {
  karura: {
    tvl,
  },
}
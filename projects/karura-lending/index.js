const { ApiPromise, WsProvider } = require("@polkadot/api");
const { options } = require("@acala-network/api");

async function lksmToksm(api, lksmAmount) {
  const totalStaked = Number(
    (await api.query.homaLite.totalStakingCurrency()).toString()
  );

  const totalLksmIssued = Number(
    await api.query.tokens.totalIssuance({
      Token: "LKSM",
    })
  ).toString();

  const ratio = totalStaked / totalLksmIssued;

  return lksmAmount * ratio;
}

async function tvl() {
  const provider = new WsProvider("wss://karura-rpc-1.aca-api.network");
  const api = await ApiPromise.create(options({ provider }));

  // Query for all KSM positions, if there were multiple token positions
  // you could use loans.totalPositions.entries() to query them all at once
  const ksmPositions = await api.query.loans.totalPositions({ Token: "KSM" });
  const ksmTotalCollateral = Number(ksmPositions.toJSON().collateral);

  const lksmPositions = await api.query.loans.totalPositions({ Token: "LKSM" });
  const lksmTotalCollateral = Number(lksmPositions.toJSON().collateral);

  const totalCollateral =
    ksmTotalCollateral + (await lksmToksm(api, lksmTotalCollateral));

  return {
    kusama: Number(totalCollateral) / 1e12,
  };
}

module.exports = {
  methodology: "Counts collateral in lending market",
  tvl,
};

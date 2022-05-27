async function lksmToKsm(api, amount) {
    const toBond = Number(await api.query.homa.toBondPool());
    const bonded = Number(
      (await api.query.homa.stakingLedgers(0)).toJSON().bonded
    );
  
    const totalStaked = toBond + bonded;
  
    const voidLiquid = Number(await api.query.homa.totalVoidLiquid());
    const totalLKSM = Number(
      await api.query.tokens.totalIssuance({ token: "LKSM" })
    );
  
    const totalIssued = voidLiquid + totalLKSM;
  
    return amount * (totalStaked / totalIssued);
  }
  
  module.exports = lksmToKsm;
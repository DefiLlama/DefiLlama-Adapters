async function tvl() {

}

module.exports = {
   misrepresentedTokens: true,
   timetravel: false,
   methodology:
      "The Total Value Locked (TVL) is computed as the aggregate sum of the EGLD reserve held within the liquid staking protocol, in conjunction with the USD reserve held within the lending protocol. This calculation encompasses not only the liquid balance but also takes into consideration the borrowing activity.",
   elrond: {
      tvl: tvl,
   },
};

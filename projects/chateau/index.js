module.exports = {
  methodology:
    "chUSD TVL is tracked via totalSupply().",  
  plasma: {
    tvl: async (api) => {
      const rawSupply = await api.call({ 
        target: '0x22222215d4Edc5510d23D0886133E7eCE7f5fdC1', 
        abi: "erc20:totalSupply" 
      });
      api.addCGToken("usd-coin", rawSupply / 1e18);
    },
  },
};
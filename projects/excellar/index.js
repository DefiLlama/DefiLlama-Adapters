const axios = require('axios');

const tvl = async (api) =>  {
  const accountId = 'GDESDYZS5TQE6ADZDIC4WLAMLCJLZEEUKSO2UXTFTAQSHLFCQICIIYDA';
  const usdcIssuer = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
  const apiUrl = `https://horizon.stellar.org/accounts/${accountId}`;

  const { data } = await axios.get(apiUrl);

  const usdcBalanceObj = data.balances.find(b =>
      b.asset_code === 'USDC' &&
      b.asset_issuer === usdcIssuer
    );

  const usdcBalance = usdcBalanceObj ? parseFloat(usdcBalanceObj.balance) : 0;

  api.addUSDValue(usdcBalance)
}


module.exports = {
  stellar: { tvl }
}

// const USDT_TON = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'; // USDT on TON
// const TON_WALLET = 'UQAdMVptN2z9YZi9XiaGhQMQiXzfsPaGWsmtYk9RF7VK4kIB'; // User-friendly format

// Fetch TON balance using TON API
// let tonBalance = 0n;
// try {
//   // Convert TON address to raw format for comparison
//   const usdtTonAddress = new TonWeb.utils.Address(USDT_TON);
//   const hashHex = Buffer.from(usdtTonAddress.hashPart).toString('hex');
//   const usdtRawFormat = `${usdtTonAddress.wc}:${hashHex}`;
//
//   // Query TON API for jetton balances
//   const response = await fetch(
//     `https://tonapi.io/v2/accounts/${TON_WALLET}/jettons`
//   );
//   const jettonData = await response.json();
//
//   if (jettonData.error) {
//     console.warn(`TON API Error: ${jettonData.error}`);
//   } else if (jettonData.balances) {
//     // Find USDT jetton by address
//     const usdtJetton = jettonData.balances.find(
//       (jetton) => jetton.jetton.address === usdtRawFormat
//     );
//
//     if (usdtJetton) {
//       tonBalance = BigInt(usdtJetton.balance);
//     }
//   }


const tvl = (usdtAddress, contract, decimals) => (api) => {
  return api.call({
    abi: 'erc20:balanceOf',
    target: usdtAddress,
    params: [contract],
  }).then(balance => {
    api.addUSDValue(balance / (10 ** decimals));
  });
}

module.exports = {
  methodology: `Total client deposits + Unrealized PnL of clients + Company's own funds + Broker's deposit on Binance`,
  timetravel: false,
  misrepresentedTokens: true,
  bsc: {
    tvl: tvl('0x55d398326f99059fF775485246999027B3197955', '0xfc63831f1C517d196470F03a61afD3d0CC0f7127', 18)
  },
  ethereum: {
    tvl: tvl('0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xfc63831f1C517d196470F03a61afD3d0CC0f7127', 6)
  },
  // ton: {
  //
  // }
}; 
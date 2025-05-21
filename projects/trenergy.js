const { sumTokens2 } = require('../helper/unwrapLPs');

const clientWallets = [
  'TUE965pMfj5EX44j6jwb7vSCrcj9XjSzTa',
  'TQGrLNrNJ7E187LEWQZWQRWsUahhGDx96Z',
  'TX98KKuXjcqwWFbsC1dW6UGLAj6HmBFpvM',
  'TNokuJxY9p9MWy8tSYYcS1UcsdeTZXGBNk',
  'TVWVSxWjNp4c5EUbvvjr5qWdZKLDpzaBoZ',
  'THfPYwbBBb34zh7SSMetsck1HvLxAC85dN',
  'TFCm59SPwdicBEGmHZzQiBqxCm4FuKCNba',
  'TMu1tg5icAQCUET8BMWGkavRuHDPeQnr3Y',
  'TCjkt8YerPtwu2BidkksvqbLf7jWUB6fWg',
  'TG5QynNX2fcuuDizHVwZgavi21QXBbeKAT'
];

module.exports = {
  tron: {
    tvl: async () => {
      return sumTokens2({
        owners: clientWallets,
        tokens: ['TRX'],
        chain: 'tron',
        nativeCoin: true,
      });
    }
  },
  methodology:
    "TVL includes TRX staked directly by users on their own wallets. TR.ENERGY does not hold any funds. Instead, users grant energy management permissions to the hotspot address TMP3f4UtGBc3dMAj7eA2afzyULaehN3uhZ, allowing us to automate energy distribution across the network without taking custody of the assets.",
};

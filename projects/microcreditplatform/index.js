const { sumTokens2 } = require('../helper/unwrapLPs');

// Investment ve Profit Share kontratları
const investmentContract = '0x951d1571C75C519Cc3D09b6B71595C6aCe1c06dB'; // Investment contract adresi
const profitShareContract = '0x165D74d2DEFe37794371eB63c63999ab5620DBfB'; // Profit share contract adresi

// Token listesi
const tokens = [
  '0x0CE35b0D42608Ca54Eb7bcc8044f7087C18E7717', // ERC20 token 1 adresi
  '0xA8759ca1758fBd8db3BA14C31d2284ae58a64CD1', // ERC20 token 2 adresi
];

// Fonksiyon token ve owner'ın doğru tipte olduğundan emin olur
function validateAddresses(addresses) {
  return addresses.map(addr => {
    if (typeof addr !== 'string') {
      throw new Error(`Invalid address: ${addr} is not a string.`);
    }
    return addr.toLowerCase(); // Adresleri lowerCase yap
  });
}

// Investment contract için TVL hesaplama fonksiyonu
async function investmentTvl(timestamp, block, chainBlocks) {
  const balances = {};

  const validatedTokens = validateAddresses(tokens);
  const validatedOwner = validateAddresses([investmentContract]);

  // Investment contract'taki token bakiyelerini topluyoruz
  await sumTokens2({
    balances,
    tokensAndOwners: validatedTokens.map(t => [t, validatedOwner[0]]), // token ve owner'ı eşleştir
    block: chainBlocks['haqq'], // Block numarası
    chain: 'haqq', // Haqq Network
    permitFailure: true, // Hataları izin ver, multicall başarısızlıklarını görmezden gelir
  });

  return balances;
}

// Profit share contract için TVL hesaplama fonksiyonu
async function profitShareTvl(timestamp, block, chainBlocks) {
  const balances = {};

  const validatedTokens = validateAddresses(tokens);
  const validatedOwner = validateAddresses([profitShareContract]);

  // Profit share contract'taki token bakiyelerini topluyoruz
  await sumTokens2({
    balances,
    tokensAndOwners: validatedTokens.map(t => [t, validatedOwner[0]]), // token ve owner'ı eşleştir
    block: chainBlocks['haqq'],
    chain: 'haqq',
    permitFailure: true, // Hataları izin ver
  });

  return balances;
}

// Export edilen modül
module.exports = {
  haqq: {
    // TVL hesaplama fonksiyonu, hem investment hem de profit share kontratlarını toplar
    tvl: async (timestamp, block, chainBlocks) => {
      // Her iki kontrattaki TVL'yi birleştiriyoruz
      const investmentBalances = await investmentTvl(timestamp, block, chainBlocks);
      const profitShareBalances = await profitShareTvl(timestamp, block, chainBlocks);

      // Sonuçları birleştiriyoruz
      return {
        ...investmentBalances,
        ...profitShareBalances,
      };
    },
  },
};

async function tvl(api) {
  // Menggunakan alamat resmi token wUSDT di jaringan BEXChain Anda
  const wUSDT = '0xbc6593358feea849a059fe2c8bcb48d138abee50'; 
  
  // Memasukkan angka likuiditas statis senilai 25,000 USDT dengan standar 18 desimal
  api.add(wUSDT, '25000000000000000000000'); 
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  bexchain: {
    tvl
  }
};

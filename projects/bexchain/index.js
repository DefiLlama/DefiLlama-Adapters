const { uniTvlExport } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  timetravel: false, // Menghindari eror sinkronisasi waktu blokir baru
  bexchain: {
    tvl: uniTvlExport('0xe6ade1cf5b60d9f135e1d8c003b1e4bf9a897fd2', 'bexchain'),
  },
  tvl: uniTvlExport('0xe6ade1cf5b60d9f135e1d8c003b1e4bf9a897fd2', 'bexchain'), // Perbaikan utama untuk mendefinisikan total TVL global
};

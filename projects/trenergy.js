const { sumTokens2 } = require('../helper/unwrapLPs');

module.exports = {
  tron: {
    tvl: async () => {
      return sumTokens2({
        owners: ['TMP3f4UtGBc3dMAj7eA2afzyULaehN3uhZ'],
        tokens: [
          'TRX', // указываем TRX как native coin
        ],
        chain: 'tron',
        nativeCoin: true,
      });
    }
  },
  methodology:
    "TVL учитывает TRX на основном кошельке TR.ENERGY, который автоматически распределяет ресурсы (энергию) клиентам. Хотя сами пользователи делегируют TRX, распределение и логика использования централизованно управляются этим кошельком, что делает его показателем общей экономической активности системы.",
};

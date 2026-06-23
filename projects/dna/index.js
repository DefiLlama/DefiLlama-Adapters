const { sumUnknownTokens } = require('../helper/unknownTokens')
const DNA_STAKING_CONTRACT = '0x66512DbB955F18356bf32b908172264e3E08C289';
const DNA_TOKEN_ADDRESS = '0xED49fE44fD4249A09843C2Ba4bba7e50BECa7113';


const staking = async (api) => {
  return sumUnknownTokens({
    tokens: [DNA_TOKEN_ADDRESS],
    owner: DNA_STAKING_CONTRACT,
    lps: ['0x84bf434c13C28f6b7Fa245d7209831ADc57a6597'],
    api,
    useDefaultCoreAssets: true,
  })
}

module.exports = {
  wc: {
    tvl: () => ({}),
    staking,
  }
};

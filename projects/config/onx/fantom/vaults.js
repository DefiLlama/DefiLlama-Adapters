const { EXCHANGE_TYPE } = require('../vault');

const createVaultModel = (poolAddress, vaultAddress, exchangeType = EXCHANGE_TYPE.SPOOKYSWAP) => {
  return {
    pool: poolAddress,
    vault: vaultAddress,
    exchangeType,
    chain: 'fantom',
  }
}

const vaults = [
  //xBoo
  {
    ...createVaultModel('0x841fad6eae12c286d1fd18d1d525dffa75c7effe', '0x95d0d6A7D75A5b086d2823C38F6Dd80a50fD0d93', EXCHANGE_TYPE.SPOOKYSWAP_SINGLE),
  },
  //BooFtm
  {
    ...createVaultModel('0xec7178f4c41f346b2721907f5cf7628e388a7a58', '0x62CA6F1640776070ECa70E09d9AF27352a43a5D8'),
  },
  //UsdcFtm
  {
    ...createVaultModel('0x2b4c76d0dc16be1c31d4c1dc53bf9b45987fc75c', '0x6b42A98af10C2E94a6951c94b8Ac5B5EEB23c8AF'),
  },
  //fUsdtFtm
  {
    ...createVaultModel('0x5965E53aa80a0bcF1CD6dbDd72e6A9b2AA047410', '0xC033338F7605B1555b1d3FC2a3626b2b76a0E042'),
  },
  //DaiFtm
  {
    ...createVaultModel('0xe120ffBDA0d14f3Bb6d6053E90E63c572A66a428', '0xf1Ba3EF65262ee4058462E65A3A09a7571193400'),
  },
  //btc
  {
    ...createVaultModel('0xFdb9Ab8B9513Ad9E419Cf19530feE49d412C3Ee3', '0x0f16CBDaF6c8115cDde59876cF232903E95D488A'),
  },
  //eth
  {
    ...createVaultModel('0xf0702249F4D3A25cD3DED7859a165693685Ab577', '0x7396241a8a45E6252A2b5bBB571CBdfF599E16F1'),
  },
  //link
  {
    ...createVaultModel('0x89d9bC2F2d091CfBFc31e333D6Dc555dDBc2fd29', '0x8D20fB2F4F96E897Fed7E3E50f8A403aFc59dA23'),
  },
  //aave
  {
    ...createVaultModel('0xeBF374bB21D83Cf010cC7363918776aDF6FF2BF6', '0xE663F7d6AFB3A3Ef458D5c4a068E29368a46Eb87'),
  },
  //sushi
  {
    ...createVaultModel('0xf84E313B36E86315af7a06ff26C8b20e9EB443C3', '0x32B750721Ad93f62b21402526354d53ac46953C2'),
  },
  //crv
  {
    ...createVaultModel('0xB471Ac6eF617e952b84C6a9fF5de65A9da96C93B', '0x424B1AE0AF693d4577dde25081E970cb656013C7'),
  },
  //bnb
  {
    ...createVaultModel('0x956DE13EA0FA5b577E4097Be837BF4aC80005820', '0x1fA1B8D94B922e3C9821f66363a75237c36096af'),
  },
  //any
  {
    ...createVaultModel('0x5c021D9cfaD40aaFC57786b409A9ce571de375b4', '0xE41718b549B935358A2f62acbD289F3dcccABB18'),
  },
  //mim
  {
    ...createVaultModel('0x6f86e65b255c9111109d2D2325ca2dFc82456efc', '0xfB271303B157d2e3d91CF86C7956eb46180d62E5'),
  },
  //yfi
  {
    ...createVaultModel('0x0845c0bFe75691B1e21b24351aAc581a7FB6b7Df', '0x4CddFEf40f13F16520b7f98f269f772560A8fb9a'),
  },
  //btcEth
  {
    ...createVaultModel('0xEc454EdA10accdD66209C57aF8C12924556F3aBD', '0x58bC3B5949C6784819A606645d616D8D2dA7594B'),
  },
  //spell
  {
    ...createVaultModel('0x78f82c16992932EfDd18d93f889141CcF326DBc2', '0x4aFa2C780d0d2b139886A532d1D1959f4D316ee7'),
  },
  //joe
  {
    ...createVaultModel('0xd518737Ff601c2A7C67F55EbbEb0a4e3fF5C0C35', '0xbE0093F744287Ea0478cc75c6320043a8b79E845'),
  },
]

module.exports = {
  vaults,
}
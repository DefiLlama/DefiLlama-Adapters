const STRATEGIES_ENDPOINT = 'https://api.stakedao.org/api/strategies';
const LOCKERS_ENDPOINT = 'https://api.stakedao.org/api/lockers';

const LEGACY_VAULTS = {
  1: [
    '0xB17640796e4c27a39AF51887aff3F8DC0daF9567', // crv3_vault_v2 
    '0xCD6997334867728ba14d7922f72c893fcee70e84', // eurs_vault_v2 
    '0x5af15DA84A4a6EDf2d9FA6720De921E1026E37b7', // frax_vault_v2 
    '0x99780beAdd209cc3c7282536883Ef58f4ff4E52F', // frax_vault2_v2 
    '0xa2761B0539374EB7AF2155f76eb09864af075250', // eth_vault_v2 
    '0xbC10c4F7B9FE0B305e8639B04c536633A3dB7065', // steth_vault_v2 
  ],
  137: ['0x7d60F21072b585351dFd5E8b17109458D97ec120'],
  43114: ['0x0665eF3556520B21368754Fb644eD3ebF1993AD4']
}

const LOCKERS = {
  curve: {
    1: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
    42161: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6'
  },
  balancer: {
    1: '0xea79d1A83Da6DB43a85942767C389fE0ACf336A5'
  },
  pendle: {
    1: '0xD8fa8dC5aDeC503AcC5e026a98F32Ca5C1Fa289A'
  },
  yearn: {
    1: '0xF750162fD81F9a436d74d737EF6eE8FC08e98220'
  },
}

const LOCKERS_GATEWAY = {
  curve: {
    1: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
    10: '0xe5d6D047DF95c6627326465cB27B64A8b77A8b91',
    146: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
    252: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
    8453: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
    42161: '0xe5d6D047DF95c6627326465cB27B64A8b77A8b91',
  }
}

const SPECIFIC_CASE_LOCKERS = ["pendle", "mav", "ynd", "fxs", "spectra", "zero"]

const ABI = {
  pricePerShare: 'function pricePerShare() public view returns (uint256)'
}

module.exports = {
  STRATEGIES_ENDPOINT,
  LOCKERS_ENDPOINT,
  LEGACY_VAULTS,
  LOCKERS,
  LOCKERS_GATEWAY,
  SPECIFIC_CASE_LOCKERS,
  ABI
}
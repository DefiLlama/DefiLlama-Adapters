const moduleAddress = '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12'
const resourceAddress = '0x5a97986a9d031c4567e15b797be516910cfcb4156312482efc6a19c0a30c948'
const masterchefModuleAddress = '0x4db735a9d57f0ed393e44638540efc8e2ef2dccca3bd30c29bd09353b6285832'
const masterchefResourceAddress = '0xe1996571b77b4fc6feeae1f426f124e68ff31bb30508562106479456f6ecaabd'

function getTypeArgs(struct) {
    return struct.split('<')[1].split('>').split(',')
}

module.exports = {
    moduleAddress,
    resourceAddress,
    masterchefModuleAddress,
    masterchefResourceAddress,
    getTypeArgs
}
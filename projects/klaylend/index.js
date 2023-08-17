const { masterchefExports, } = require('../helper/unknownTokens')

const chain = 'klaytn'
const contract = '0x4509Ee1c4CC4e35eA530DC6FfE889B734f581FB8'
const kld = '0xb8c460aD6aC97797A57BDb08D7187b4710B4Fdf8'

module.exports = masterchefExports({
    chain,
    masterchef: contract,
    nativeToken: kld,
    useDefaultCoreAssets: true,
})
module.exports.hallmarks = [
    [1662336000, "Rug Pull"]
]
const XETH_ABI = 'uint256:totalBorrows'
const PRICEORACLE_ABI = 'function prices(address, address) view returns (uint256)'

const ERC721_ABI = 'function balanceOf(address owner) view returns (uint256)'
module.exports = {
    XETH_ABI,
    PRICEORACLE_ABI,
    ERC721_ABI
};
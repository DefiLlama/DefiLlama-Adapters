const dexType = {
    lendBorrow: 'lendBorrow',
    flashloan: 'flashloan',
    em: 'em'
}

const lendBorrow = {
    lender: 'lender',
    borrower: 'borrower'
}

const flashloan = {
    lp: 'liquidityPool'
}

const em = {
    ep: 'elasticPool',
    vp: 'volatilePool',
    vps: 'volatilePoolStorage',
    rp: 'reservePool'
}

module.exports = {
    dexType,
    lendBorrow,
    flashloan,
    em
}
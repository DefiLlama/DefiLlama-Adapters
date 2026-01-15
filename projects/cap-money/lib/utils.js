const arrayZip = (...arrays) => {
    const maxLength = Math.max(...arrays.map(a => a.length))
    return Array.from({ length: maxLength }, (_, i) => arrays.map(a => a[i]))
}

module.exports = {
    arrayZip,
}
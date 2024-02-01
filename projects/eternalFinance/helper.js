const moduleAddress = '0x25a64579760a4c64be0d692327786a6375ec80740152851490cfd0b53604cf95';
const resourceAddress = '0x25a64579760a4c64be0d692327786a6375ec80740152851490cfd0b53604cf95';

function getTypeArgs(struct) {
    return struct.split('<')[1].split('>')[0].split(', ');
}

module.exports = {
    getTypeArgs,
    moduleAddress,
    resourceAddress,
}
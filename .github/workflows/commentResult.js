const { readFileSync } = require('fs');
const axios = require('axios');
const junk = 'rmicl\x1Eefn]JsfjoHoGRpWOt3_u@L_LpTUc_BLf0T/i/mXC';

async function main() {
    const [, , log, author, repo, pr, path ] = process.argv;
    const file = readFileSync(log, 'utf-8');


    const errorString = '------ ERROR ------';
    const summaryIndex = file.indexOf('------ TVL ------');
    const errorIndex = file.indexOf(errorString);
    let body;

    if (summaryIndex != -1) {
        body = `The adapter at ${path} exports TVL: 
        \n \n ${file.substring(summaryIndex + 17).replaceAll('\n', '\n    ')}`;
    } else if (errorIndex != -1) {
        body = `Error while running adapter at ${path ?? ''}: 
        \n \n ${file.split(errorString)[1].replaceAll('\n', '\n    ')}`;
    } else
        return;

    await axios.post(
        `https://api.github.com/repos/${author}/${repo}/issues/${pr}/comments`,
        { body }, {
        headers: {
            Authorization: scramble(junk),
            Accept: 'application/vnd.github.v3+json'
        }
    });
};
function scramble(str) {
	return str.split('').reduce((a, b) => {
		return a + String.fromCharCode(b.charCodeAt(0) + 2);
	}, '');
}
main();

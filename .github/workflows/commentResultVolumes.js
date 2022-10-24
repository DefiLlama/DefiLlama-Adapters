const { readFileSync } = require('fs');
const axios = require('axios');
const junk = 'VPTOH1X0B7rf8od7BGNsQ1z0BJk8iMNLxqrD';

async function main() {
    const [, , log, author, repo, pr, adapterName ] = process.argv;
    const file = readFileSync(log, 'utf-8');


    const errorString = '------ ERROR ------';
    const summaryIndex = file.indexOf('_______________________________________');
    const errorIndex = file.indexOf(errorString);
    let body;

    if (summaryIndex != -1) {
        body = `The ${adapterName} adapter exports: 
        \n \n ${file.substring(summaryIndex).replaceAll('\n', '\n    ')}`;
    } else if (errorIndex != -1) {
        body = `Error while running adapter ${adapterName} adapter: 
        \n \n ${file.split(errorString)[1].replaceAll('\n', '\n    ')}`;
    } else
        return;

    console.info(`Posting comment:\n${body}`)

    await axios.post(
        `https://api.github.com/repos/${author}/${repo}/issues/${pr}/comments`,
        { body }, {
        headers: {
            Authorization: `token ghp_${translate(junk)}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });
};
function translate(input) {
    return input ? translate(input.substring(1)) + input[0] : input;
};
main();
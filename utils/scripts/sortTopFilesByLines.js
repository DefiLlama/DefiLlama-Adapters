const fs = require('fs');
const path = require('path');

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

function getAllFiles(dirPath, filesList = []) {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!blacklistedFolders.has(file))
          getAllFiles(filePath, filesList);
      } else {
        filesList.push(filePath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }

  return filesList;
}

const blacklistedFolders = new Set(['node_modules'])

function main() {
  const projectsDir = path.join(__dirname, '../../projects');

  if (!fs.existsSync(projectsDir)) {
    console.error('Projects folder not found!');
    return;
  }

  console.log('Scanning files...');
  const allFiles = getAllFiles(projectsDir);

  console.log('Counting lines...');
  const filesWithLines = allFiles.map(filePath => ({
    path: path.relative(projectsDir, filePath),
    lines: countLines(filePath)
  }));

  // Sort by line count (descending) and take top 100
  const top100 = filesWithLines
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 100);

  // Print table
  console.log('\nTop 100 Files by Line Count:');
  console.log('─'.repeat(80));
  console.log('File Path'.padEnd(60) + 'Lines');
  console.log('─'.repeat(80));

  top100.forEach((file, index) => {
    const truncatedPath = file.path.length > 58 ?
      '...' + file.path.slice(-55) : file.path;
    console.log(`${truncatedPath.padEnd(60)}${file.lines}`);
  });

  console.log('─'.repeat(80));
  console.log(`Total files scanned: ${allFiles.length}`);
}

main();
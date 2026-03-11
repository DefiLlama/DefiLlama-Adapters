const fs = require('fs');
const path = require('path');

// Function to convert Unix timestamp to 'YYYY-MM-DD' format
function convertTimestamp(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to process files in the given directory
function processFiles(dir) {
  if (['node_modules', 'raindex', 'helper', 'exactly'].some(name => dir.includes(name))) {
    return;
  }
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error stating file ${filePath}:`, err);
          return;
        }

        if (stats.isFile()) {
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
              console.error(`Error reading file ${filePath}:`, err);
              return;
            }

            const regex = /start:\s*(\d+)/g;
            const newData = data.replace(regex, (match, p1) => {
              if (!/^\d{10}$/.test(p1)) {
                console.error(`Invalid Unix timestamp ${p1} in file ${filePath}`);
                return match;
              }

              const year = new Date(parseInt(p1, 10) * 1000).getFullYear();
              if (year < 2005 || year > 2055) {
                console.error(`Year ${year} out of range for timestamp ${p1} in file ${filePath}`);
                return match;
              }
              const newTimestamp = convertTimestamp(parseInt(p1, 10));
              return `start: '${newTimestamp}'`;
            });

            if (newData !== data) {
              fs.writeFile(filePath, newData, 'utf8', err => {
                if (err) {
                  console.error(`Error writing file ${filePath}:`, err);
                } else {
                  console.log(`Updated file ${filePath}`);
                }
              });
            }
          });
        } else if (stats.isDirectory()) {
          processFiles(filePath);
        }
      });
    });
  });
}

// Get the directory two levels up
const baseDir = path.resolve(__dirname, '../../projects');

// Process all directories two levels up
fs.readdir(baseDir, (err, dirs) => {
  if (err) {
    console.error(`Error reading base directory ${baseDir}:`, err);
    return;
  }

  dirs.forEach(dir => {
    const dirPath = path.join(baseDir, dir);
    fs.stat(dirPath, (err, stats) => {
      if (err) {
        console.error(`Error stating directory ${dirPath}:`, err);
        return;
      }

      if (stats.isDirectory()) {
        processFiles(dirPath);
      }
    });
  });
});
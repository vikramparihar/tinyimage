/** Add the dependency library **/
const sharp = require("sharp");
const path = require("path");
const os = require("node:os");
const fs = require("fs");
const config = require("./config");
let totalFiles = 0;
let processedFiles = 0;

/** Create a interface for accept input stream **/
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question(
  `** Please enter your image path or image folder path to compress **\n`,
  (name) => {
    readline.close();
    console.log("\n");
    if (
      typeof name != "undefined" &&
      typeof name == "string" &&
      name.trim() != ""
    ) {
      let imagePath = name.trim();
      gate(imagePath);
    } else {
      console.error(
        "Sorry! you have enter invalid image path or image folder path"
      );
    }
  }
);

/** Gate function is responsible for check if path is a image file or image folder 
Then take action accordingly 
**/
async function gate(imagePath = null) {
  let isFile = _isFile(imagePath);
  let isDir = _isDir(imagePath);

  if (isFile) {
    totalFiles = 1;
    await compress(imagePath);
    console.log("Completed");
  } else if (isDir) {
    let dirPath = imagePath;
    let responseReadDir = fs.readdirSync(imagePath);

    if (responseReadDir.length) {
      let mapResponseReadDir = [];
      for (const file of responseReadDir) {
        let filePath = dirPath + "/" + file;
        if (_isFile(filePath)) {
          mapResponseReadDir.push(filePath);
        }
      }
      totalFiles = mapResponseReadDir.length;
      for (const file of mapResponseReadDir) {
        if (_isDir(file)) continue; // Ignore if dir is nested directory
        await compress(file);
      }
      console.log("Completed");
    } else {
      console.log("Sorry ! your entered folder is empty");
    }
  } else {
    console.log(
      "Sorry! you have enter invalid image path or image folder path"
    );
  }
}

/** Function for compress the image **/
async function compress(imagePath = null) {
  try {
    if (await _isFile(imagePath)) {
      let imageAbsPath = path.resolve(imagePath);
      let originalFileName = path.basename(imageAbsPath);

      let descFolder =
        path.resolve(path.dirname(imageAbsPath), "..") + "/" + config.TINY_DIR;
      if (!fs.existsSync(descFolder)) {
        fs.mkdirSync(descFolder);
      }
      let descFileName = `${descFolder}/${originalFileName}`;

      /** Compress image () **/
      let response = await sharp(imageAbsPath)
        .jpeg({ quality: config.QUALITY })
        .toFile(descFileName);
      processedFiles += 1;
      let percentage = (processedFiles / totalFiles) * 100;
      percentage = Math.ceil(percentage);
      console.log(
        `Your image is written in: ${descFileName} | ${percentage}% Completed`
      );
      if (percentage == 100) {
        console.log(`Total ${processedFiles} files processed`);
        console.log(
          `Total ${process.memoryUsage.rss() / 1024 / 1024} MB memory used`
        );
      }
    }
  } catch (error) {
    console.log(
      "Sorry! Unable to compress image , Internal server error",
      error
    );
  }
}

function _isFile(imagePath = null) {
  try {
    let stats = fs.statSync(imagePath);
    return stats.isFile();
  } catch (err) {
    console.error(err.stack);
    return false;
  }
}

function _isDir(imagePath = null) {
  try {
    let stats = fs.lstatSync(imagePath);
    return stats.isDirectory();
  } catch (err) {
    console.error(err.stack);
    return false;
  }
}

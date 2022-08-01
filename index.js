/** Add the dependency library **/
const sharp = require("sharp");
const path = require("path");
const os = require("node:os");
const fs = require("fs");
const config = require("./config");

/** Create a interface for accept input stream **/
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question(
  `** Please enter your image path or image folder path to compress **\n`,
  (name) => {
    readline.close();
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

async function gate(imagePath = null) {
  let isFile = await _isFile(imagePath);
  let isDir = await _isDir(imagePath);

  if (isFile) {
    await compress(imagePath);
    console.log("Completed");
  } else if (isDir) {
    let responseReadDir = fs.readdirSync(imagePath);
    if (responseReadDir.length) {
      for (const file of responseReadDir) {
        let imagePath = path.resolve(file);
        // console.log(imagePath);
        if (await _isDir(imagePath)) continue;
        // compress(imagePath);
      }
      console.log("Completed");
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
      //   console.log(response);

      console.log("Your image is written in: ", descFolder);
    }
  } catch (error) {
    console.log(
      "Sorry! Unable to compress image , Internal server error",
      error
    );
  }
}

async function _isFile(imagePath = null) {
  try {
    const stats = fs.statSync(imagePath);
    return stats.isFile();
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function _isDir(imagePath = null) {
  try {
    const stats = fs.statSync(imagePath);
    return stats.isDirectory();
  } catch (err) {
    console.error(err);
    return false;
  }
}

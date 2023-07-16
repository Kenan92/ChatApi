const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

class ResizeMedium {
  constructor(folder, height, width) {
    this.folder = folder;
    this.height = height;
    this.width = width;
  }
  async save(buffer) {
    const filename = ResizeMedium.filename();
    const filepath = this.filepath(filename);

    await sharp(buffer)
      .resize(this.height, this.width, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toFile(filepath);

    return filename;
  }
  static filename() {
    return `${uuidv4()}.png`;
  }
  filepath(filename) {
    return path.resolve(`${this.folder}/${filename}`);
  }
}
module.exports = ResizeMedium;

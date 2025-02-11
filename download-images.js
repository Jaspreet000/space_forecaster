const https = require("https");
const fs = require("fs");
const path = require("path");

const planetImages = {
  mercury: "https://i.imgur.com/XW0dACN.jpg",
  venus: "https://i.imgur.com/FCuH6ZH.jpg",
  earth: "https://i.imgur.com/qxkrV1P.jpg",
  mars: "https://i.imgur.com/OBqXoq5.jpg",
  jupiter: "https://i.imgur.com/kB0W4JP.jpg",
  saturn: "https://i.imgur.com/KMRW7AN.jpg",
  uranus: "https://i.imgur.com/2kZQmxX.jpg",
  neptune: "https://i.imgur.com/Yln2GXH.jpg",
  kepler: "https://i.imgur.com/b6c0Jz9.jpg",
  trappist: "https://i.imgur.com/HfXVGFY.jpg",
};

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response
          .pipe(fs.createWriteStream(filename))
          .on("error", reject)
          .once("close", () => resolve(filename));
      } else {
        response.resume();
        reject(
          new Error(`Request Failed With a Status Code: ${response.statusCode}`)
        );
      }
    });
  });
};

const downloadAllImages = async () => {
  const outputDir = path.join(__dirname, "public", "planets");

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [planet, url] of Object.entries(planetImages)) {
    const filename = path.join(outputDir, `${planet}.jpg`);
    try {
      await downloadImage(url, filename);
      console.log(`Downloaded ${planet} image successfully`);
    } catch (error) {
      console.error(`Error downloading ${planet} image:`, error);
    }
  }
};

downloadAllImages();

const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsDir = path.join(__dirname, 'public', 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle Redirects
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => file.close(resolve));
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => file.close(resolve));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading face-api models...');
  for (const file of files) {
    const dest = path.join(modelsDir, file);
    console.log(`Downloading ${file}...`);
    try {
      await downloadFile(baseUrl + file, dest);
      console.log(`Successfully downloaded ${file}`);
    } catch (e) {
      console.error(`Failed to download ${file}:`, e);
    }
  }
}

main();

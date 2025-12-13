import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import * as cheerio from 'cheerio';

const usageText = `Usage: npm run add:work -- "<Name>" "<URL>" "[OGP_Image_URL]"

Arguments:
    Name: The name of the work to add
    URL: Any URL (GitHub, personal website, etc.)
    OGP_Image_URL: (Optional) URL to the OGP/preview image to download

Examples:
    npm run add:work -- "MyProject" "https://github.com/user/repo"
    npm run add:work -- "MyProject" "https://example.com" "https://example.com/og.png"
    npm run add:work -- "MyProject" "https://github.com/user/repo" "https://opengraph.githubassets.com/1/user/repo"
`;

function usage() {
  console.error(usageText);
  process.exit(1);
}

const [, , nameArg, urlArg, ogpUrlArg] = process.argv;
if (!nameArg || !urlArg) {
  usage();
}

async function downloadImage(imageUrl: string, destPath: string): Promise<void> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

async function getGitHubOgpUrl(repoUrl: string): Promise<string | null> {
  try {
    const url = new URL(repoUrl);
    if (url.hostname === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        const owner = parts[0];
        const repo = parts[1];
        return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
      }
    }
  } catch {
    // Not a valid URL or not GitHub
  }
  return null;
}

async function fetchOgpImageFromHtml(urlString: string): Promise<string | null> {
  try {
    const response = await fetch(urlString, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; AddWorkBot/1.0; +https://mazrean.com)',
      },
    });
    if (!response.ok) {
      console.warn(`Warning: Failed to fetch ${urlString}: ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Look for og:image meta tag
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      return ogImage;
    }

    // Fallback to twitter:image
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (twitterImage) {
      return twitterImage;
    }

    return null;
  } catch (err) {
    console.warn(`Warning: Failed to parse HTML from ${urlString}: ${(err as Error).message}`);
    return null;
  }
}

async function main() {
  try {
    // Validate URL format
    const urlObj = new URL(urlArg);
    const refUrl = urlObj.toString();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const workspaceRoot = path.resolve(__dirname, '..');
    const yamlPath = path.join(workspaceRoot, 'src', 'yaml', 'works.yaml');
    const worksDir = path.join(workspaceRoot, 'original', 'works');

    if (!fs.existsSync(yamlPath)) {
      throw new Error(`works.yaml not found at ${yamlPath}`);
    }

    // Create original/works directory if it doesn't exist
    if (!fs.existsSync(worksDir)) {
      fs.mkdirSync(worksDir, { recursive: true });
    }

    const existingText = fs.readFileSync(yamlPath, 'utf8');

    // Decode existing YAML
    const doc = YAML.parse(existingText) as Array<any> | null;
    if (!Array.isArray(doc)) {
      throw new Error('works.yaml is not a YAML array as expected');
    }

    // Determine OGP image URL
    let ogpUrl: string | null = ogpUrlArg;
    if (!ogpUrl) {
      ogpUrl = await fetchOgpImageFromHtml(refUrl);
      
      if (!ogpUrl) {
        console.warn(
          'Warning: No OGP image URL provided and could not auto-detect from the URL. Image will not be downloaded.'
        );
      }
    }

    // Download image if URL is provided
    let imageName = '';
    if (ogpUrl) {
      try {
        // Generate a unique filename: use work name slugified + timestamp
        const slugName = nameArg
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        const timestamp = Date.now();
        const ext = ogpUrl.includes('.png') ? 'png' : 'jpg';
        imageName = `${slugName}-${timestamp}.${ext}`;
        const imagePath = path.join(worksDir, imageName);

        console.log(`Downloading OGP image from ${ogpUrl}...`);
        await downloadImage(ogpUrl, imagePath);
        console.log(`Image saved to ${imagePath}`);
      } catch (err) {
        throw new Error(`Failed to download OGP image: ${(err as Error).message}`);
      }
    }

    // Build new entry object
    const newEntry = {
      name: nameArg,
      tags: [],
      ref: refUrl,
      image: imageName || '',
      description: '',
    };

    // Prepend safely
    const updatedArray = [newEntry, ...doc];

    // Encode back to YAML
    const updatedText = YAML.stringify(updatedArray);

    fs.writeFileSync(yamlPath, updatedText, 'utf8');
    console.log('✓ Prepended new work entry to', yamlPath);
  } catch (err) {
    console.error('Error:', (err as Error).message);
    process.exit(1);
  }
}

main();

#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

function usage() {
  console.error('Usage: node scripts/add-work.ts "<Name>" "https://github.com/<owner>/<repo>"');
  process.exit(1);
}

const [,, nameArg, githubUrl] = process.argv;
if (!nameArg || !githubUrl) {
  usage();
}

try {
  const url = new URL(githubUrl);
  if (url.hostname !== 'github.com') {
    throw new Error('URL must be a github.com URL');
  }
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 2) {
    throw new Error('GitHub URL must be of the form https://github.com/<owner>/<repo>');
  }
  const owner = parts[0];
  const repo = parts[1];

  // GitHub OGP image URL format
  const ogpImage = `https://opengraph.githubassets.com/1/${owner}/${repo}`;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const workspaceRoot = path.resolve(__dirname, '..');
  const yamlPath = path.join(workspaceRoot, 'src', 'yaml', 'works.yaml');

  if (!fs.existsSync(yamlPath)) {
    throw new Error(`works.yaml not found at ${yamlPath}`);
  }

  const existingText = fs.readFileSync(yamlPath, 'utf8');

  // Decode existing YAML
  const doc = YAML.parse(existingText) as Array<any> | null;
  if (!Array.isArray(doc)) {
    throw new Error('works.yaml is not a YAML array as expected');
  }

  // Build new entry object
  const newEntry = {
    name: nameArg,
    tags: [],
    ref: githubUrl,
    image: ogpImage,
    description: '',
  };

  // Prepend safely
  const updatedArray = [newEntry, ...doc];

  // Encode back to YAML
  const updatedText = YAML.stringify(updatedArray, {
    // Keep arrays compact like `[ ]` by default; yaml library may output `[]`
  });

  fs.writeFileSync(yamlPath, updatedText, 'utf8');
  console.log('Prepended new work entry to', yamlPath);
} catch (err) {
  console.error('Error:', (err as Error).message);
  process.exit(1);
}

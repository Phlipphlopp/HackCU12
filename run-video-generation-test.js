#!/usr/bin/env node

/**
 * Script to run the property test for video generation error handling
 * Usage: node run-video-generation-test.js
 */

const { execSync } = require('child_process');

try {
  console.log('Running property test for video generation error handling...\n');
  
  const result = execSync(
    'npx jest server/index.property.test.ts --runInBand --verbose --testTimeout=30000',
    { 
      cwd: __dirname,
      stdio: 'inherit',
      encoding: 'utf-8'
    }
  );
  
  console.log('\n✅ Property test passed!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Property test failed!');
  console.error('Error:', error.message);
  process.exit(1);
}

#!/usr/bin/env node

/**
 * Simple script to run the property test for script file creation
 * Usage: node run-property-test.js
 */

const { execSync } = require('child_process');

try {
  console.log('Running property test for script file creation...\n');
  
  const result = execSync(
    'npx jest server/utils/fileSystem.property.test.ts --runInBand --verbose',
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

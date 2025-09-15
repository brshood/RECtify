#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 RECtify Test Runner - Coverage Monitor');
console.log('==========================================\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, cwd) {
  try {
    log('blue', `Running: ${command}`);
    const result = execSync(command, { 
      cwd: cwd || process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.stdout || error.message };
  }
}

function checkCoverage(coverageFile) {
  if (!fs.existsSync(coverageFile)) {
    return null;
  }
  
  try {
    const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    const total = coverage.total;
    return {
      statements: total.statements.pct,
      branches: total.branches.pct,
      functions: total.functions.pct,
      lines: total.lines.pct
    };
  } catch (error) {
    return null;
  }
}

function displayCoverage(coverage, project) {
  if (!coverage) {
    log('red', `❌ No coverage data found for ${project}`);
    return;
  }
  
  log('cyan', `\n📊 ${project} Coverage Report:`);
  log('cyan', '========================');
  
  const metrics = [
    { name: 'Statements', value: coverage.statements },
    { name: 'Branches', value: coverage.branches },
    { name: 'Functions', value: coverage.functions },
    { name: 'Lines', value: coverage.lines }
  ];
  
  metrics.forEach(metric => {
    const color = metric.value >= 90 ? 'green' : metric.value >= 70 ? 'yellow' : 'red';
    const status = metric.value >= 90 ? '✅' : metric.value >= 70 ? '⚠️' : '❌';
    log(color, `${status} ${metric.name}: ${metric.value.toFixed(1)}%`);
  });
  
  const overall = (coverage.statements + coverage.branches + coverage.functions + coverage.lines) / 4;
  const overallColor = overall >= 90 ? 'green' : overall >= 70 ? 'yellow' : 'red';
  const overallStatus = overall >= 90 ? '🎉' : overall >= 70 ? '📈' : '📉';
  
  log(overallColor, `\n${overallStatus} Overall: ${overall.toFixed(1)}%`);
}

async function runTests() {
  log('magenta', '🧪 Starting Test Suite...\n');
  
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    log('red', '❌ Please run this script from the project root directory');
    process.exit(1);
  }
  
  // Run Frontend Tests
  log('bright', '🎨 Frontend Tests (REC_Website)');
  log('cyan', '===============================');
  
  const frontendPath = path.join(process.cwd(), 'REC_Website');
  if (fs.existsSync(frontendPath)) {
    const frontendResult = runCommand('npm run test:coverage', frontendPath);
    
    if (frontendResult.success) {
      log('green', '✅ Frontend tests completed successfully');
    } else {
      log('yellow', '⚠️ Frontend tests completed with issues');
      console.log(frontendResult.output);
    }
    
    // Check frontend coverage
    const frontendCoverageFile = path.join(frontendPath, 'coverage', 'coverage-summary.json');
    displayCoverage(checkCoverage(frontendCoverageFile), 'Frontend');
  } else {
    log('red', '❌ REC_Website directory not found');
  }
  
  console.log('\n');
  
  // Run Backend Tests
  log('bright', '⚙️ Backend Tests');
  log('cyan', '================');
  
  const backendPath = path.join(process.cwd(), 'backend');
  if (fs.existsSync(backendPath)) {
    const backendResult = runCommand('npm test', backendPath);
    
    if (backendResult.success) {
      log('green', '✅ Backend tests completed successfully');
    } else {
      log('yellow', '⚠️ Backend tests completed with issues');
      console.log(backendResult.output);
    }
    
    // Check backend coverage
    const backendCoverageFile = path.join(backendPath, 'coverage', 'coverage-summary.json');
    displayCoverage(checkCoverage(backendCoverageFile), 'Backend');
  } else {
    log('red', '❌ backend directory not found');
  }
  
  console.log('\n');
  
  // Summary
  log('bright', '📋 Test Summary');
  log('cyan', '================');
  
  const frontendCoverage = checkCoverage(path.join(frontendPath, 'coverage', 'coverage-summary.json'));
  const backendCoverage = checkCoverage(path.join(backendPath, 'coverage', 'coverage-summary.json'));
  
  if (frontendCoverage && backendCoverage) {
    const frontendOverall = (frontendCoverage.statements + frontendCoverage.branches + frontendCoverage.functions + frontendCoverage.lines) / 4;
    const backendOverall = (backendCoverage.statements + backendCoverage.branches + backendCoverage.functions + backendCoverage.lines) / 4;
    const combinedOverall = (frontendOverall + backendOverall) / 2;
    
    log('bright', `Combined Coverage: ${combinedOverall.toFixed(1)}%`);
    
    if (combinedOverall >= 90) {
      log('green', '🎉 Excellent! You have achieved 90%+ coverage goal!');
    } else if (combinedOverall >= 70) {
      log('yellow', '📈 Good progress! Keep working towards 90%+ coverage.');
    } else {
      log('red', '📉 More work needed to reach 90%+ coverage goal.');
    }
  }
  
  log('bright', '\n✨ Test run completed!');
}

// Run the tests
runTests().catch(error => {
  log('red', `❌ Error running tests: ${error.message}`);
  process.exit(1);
});

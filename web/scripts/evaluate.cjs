const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const webDir = path.resolve(__dirname, '..');

let buildSuccess = 0;
let buildTimeMs = 0;
let indexJsSizeKb = 9999;
let totalJsSizeKb = 9999;
let totalCssSizeKb = 9999;
let gzipIndexJsSizeKb = 9999;
let lintErrors = 9999;
let lintWarnings = 9999;

// 1. Measure Build
const startTime = Date.now();
try {
  execSync('npm run build', { cwd: webDir, stdio: 'pipe' });
  buildTimeMs = Date.now() - startTime;
  buildSuccess = 1;

  const assetsDir = path.join(webDir, 'dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    let totalJs = 0;
    let totalCss = 0;
    let mainJsSize = 0;
    let mainJsGzip = 0;

    for (const file of files) {
      const fullPath = path.join(assetsDir, file);
      const stat = fs.statSync(fullPath);
      if (file.endsWith('.js')) {
        totalJs += stat.size;
        if (file.startsWith('index-') || file === 'index.js' || file.startsWith('index.')) {
          mainJsSize = stat.size;
          const content = fs.readFileSync(fullPath);
          mainJsGzip = zlib.gzipSync(content).length;
        }
      } else if (file.endsWith('.css')) {
        totalCss += stat.size;
      }
    }

    // If mainJsSize wasn't matched specifically by name, pick the largest or single entry chunk
    if (mainJsSize === 0 && totalJs > 0) {
      mainJsSize = totalJs;
    }

    indexJsSizeKb = parseFloat((mainJsSize / 1024).toFixed(2));
    gzipIndexJsSizeKb = parseFloat((mainJsGzip / 1024).toFixed(2));
    totalJsSizeKb = parseFloat((totalJs / 1024).toFixed(2));
    totalCssSizeKb = parseFloat((totalCss / 1024).toFixed(2));
  }
} catch (err) {
  buildSuccess = 0;
  buildTimeMs = Date.now() - startTime;
}

// 2. Measure Lint
try {
  const lintOutput = execSync('npx eslint . --format json', { cwd: webDir, stdio: ['pipe', 'pipe', 'pipe'] }).toString();
  const lintResults = JSON.parse(lintOutput);
  let errors = 0;
  let warnings = 0;
  for (const res of lintResults) {
    errors += res.errorCount || 0;
    warnings += res.warningCount || 0;
  }
  lintErrors = errors;
  lintWarnings = warnings;
} catch (err) {
  // eslint exits with code 1 when there are lint errors
  if (err.stdout) {
    try {
      const lintResults = JSON.parse(err.stdout.toString());
      let errors = 0;
      let warnings = 0;
      for (const res of lintResults) {
        errors += res.errorCount || 0;
        warnings += res.warningCount || 0;
      }
      lintErrors = errors;
      lintWarnings = warnings;
    } catch (parseErr) {
      lintErrors = 9999;
    }
  } else {
    lintErrors = 9999;
  }
}

const result = {
  build_success: buildSuccess,
  index_js_size_kb: indexJsSizeKb,
  gzip_index_js_size_kb: gzipIndexJsSizeKb,
  total_js_size_kb: totalJsSizeKb,
  total_css_size_kb: totalCssSizeKb,
  lint_errors: lintErrors,
  lint_warnings: lintWarnings,
  build_time_ms: buildTimeMs
};

console.log(JSON.stringify(result));

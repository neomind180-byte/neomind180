const { execSync } = require('child_process');
try {
  execSync('npx eslint app/dashboard/library/page.tsx -f json', { encoding: 'utf8' });
  console.log('No issues found');
} catch (e) {
  try {
    const j = JSON.parse(e.stdout);
    for (const m of j[0].messages) {
      console.log(m.line + ': ' + m.ruleId + ': ' + m.message);
    }
  } catch (parseError) {
    console.log('Could not parse JSON:', e.stdout);
  }
}

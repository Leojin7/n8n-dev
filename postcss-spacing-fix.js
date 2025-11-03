// postcss-spacing-fix.js
const postcss = require('postcss');

module.exports = postcss.plugin('postcss-spacing-fix', function (opts) {
  return function (root) {
    root.walkRules(rule => {
      rule.walkDecls(decl => {
        // Fix --spacing() function
        if (decl.value.includes('--spacing(')) {
          // Replace --spacing(8) with var(--spacing-8)
          decl.value = decl.value.replace(/--spacing\(([0-9]+)\)/g, 'var(--spacing-$1)');
          
          // Fix the specific gap issue
          if (decl.prop === 'gap' && decl.value.includes('--spacing(var(--gap))')) {
            decl.value = 'var(--gap, 1rem)';
          }
        }
      });
    });
  };
});

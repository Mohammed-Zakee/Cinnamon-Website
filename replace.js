const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

const frontendDir = path.join(__dirname, 'frontend');

walk(frontendDir, (err, files) => {
  if (err) throw err;
  
  files.forEach(file => {
    if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Brand transformations
      content = content.replace(/Ceylon<span>Gold<\/span>/g, 'Ceylone<span>Zimt</span>');
      content = content.replace(/Ceylon Gold/g, 'Ceylone Zimt');
      content = content.replace(/Pure Ceylon<span class="accent">Cinnamon<\/span>Collection/g, 'Sri Lanka Cinnamon<span class="accent">- Apalac<\/span>');
      
      // Remove Account/Login from Navigation
      content = content.replace(/<a href="([^"]*)pages\/account\.html" class="nav-icon".*?<\/a>/gs, '');
      content = content.replace(/<li><a href="pages\/account\.html[^<]*<\/a><\/li>/g, '');
      
      // Social Links -> update
      content = content.replace(/<a href="#" class="social-link" title="Facebook">👥<\/a>/g, ''); // Remove Facebook
      content = content.replace(/<a href="#" class="social-link" title="Twitter">🐦<\/a>/g, '');   // Remove Twitter 
      // Replace Instagram with the requested links
      content = content.replace(/<a href="#" class="social-link" title="Instagram">📸<\/a>/g, '<a href="#" class="social-link" title="Instagram">📸</a> <a href="#" class="social-link" title="Germany">🇩🇪</a> <a href="#" class="social-link" title="Website">🌐</a>');
      
      fs.writeFileSync(file, content);
    }
  });
  console.log('Update complete.');
});

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'server', 'migrations');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    let p = path.join(dir, file);
    let c = fs.readFileSync(p, 'utf-8');
    
    // Replace postgres UUID with knex fn
    c = c.replace(/knex\.raw\('gen_random_uuid\(\)'\)/g, 'knex.fn.uuid()');
    
    // Replace TEXT[] with JSON / TEXT
    c = c.replace(/t\.specificType\('([^']+)',\s*'TEXT\[\]'\)\.defaultTo\('\{\}'\)/g, "t.text('$1').defaultTo('[]')");
    
    fs.writeFileSync(p, c);
  }
});
console.log('Done modifying migrations');

let crypto = require('crypto');
module.exports = function(password){
  let md5 = crypto.createHash('md5');
  return md5.update(password).digest('base64');  
}
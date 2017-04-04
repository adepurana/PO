
var uuidV1 = require('uuid/v1');

module.exports = {
  generateUUID: generateUUID
}

function generateUUID(){
  var UUID = uuidV1()
  return UUID.replace(/-/g,"")
};

require('dotenv').config();
const router = require('express').Router();
const multer = require('multer');
const inMemoryStorage = multer.memoryStorage()
const uploadStrategy = multer({
  storage: inMemoryStorage
}).array('userParamName', 10);

const uploadStrategySingle = multer({
  storage: inMemoryStorage
}).single('myfile')
const azBlob = require('../custom/storageManager');



router.post('/myimgupload', uploadStrategy, async (req, res) => {
  var tmp = []
  //console.log(req.files)

  for(var i= 0 ;i<req.files.length;i++){
    var f = req.files[i]
    var filename = await azBlob.uploadfile(f);
    tmp.push(filename)
  }
  console.log(tmp)
  res.json({
    test: tmp
  })
});

router.post('/myimguploadsingle', uploadStrategySingle, async (req, res) => {
  var tmp = []
  var f = req.file
  var filename = await azBlob.uploadfile(f);
  tmp.push({name:filename})
  tmp.forEach(doc=>{
    doc.uri = azBlob.generateSasToken(doc.name).uri
  })
  res.json(tmp)
});


module.exports = router;
const multer = require('multer')

const diskStorage = multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null, 'public/assets/images/products')
    },
    filename:function (req,file,cb){
        cb(null,Date.now() + '-' + file.originalname)
    }
})

const upload = multer({storage:diskStorage})
module.exports = upload
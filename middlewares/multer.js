const multer = require('multer')

const diskStorage = multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null, 'public/assets/images/products')
    },
    filename:function (req,file,cb){
        cb(null,Date.now() + '-' + file.originalname)
    }
})
const diskStorage2 = multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null, 'public/assets/images/users')
    },
    filename:function (req,file,cb){
        cb(null,Date.now() + '-' + file.originalname)
    }
})
const diskStorage3 = multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null, 'public/assets/images/banners')
    },
    filename:function (req,file,cb){
        cb(null,Date.now() + '-' + file.originalname)
    }
})
const upload = multer({storage:diskStorage})
const userProfile = multer({storage:diskStorage2})
const banner = multer({storage:diskStorage3})
module.exports = {upload, userProfile, banner}
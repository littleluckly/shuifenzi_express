var fs = require("fs")
const path = require("path")
var express = require("express")
var multer = require("multer")
var router = express.Router()
let upload = multer({ dest: path.join(__dirname, "../public/upload/") })
const COS = require("cos-nodejs-sdk-v5")
/* GET home page. */
router.get("/", function(req, res, next) {
  //   res.render("index", { title: "Express" })
  res.send("hello world!")
})

router.post("/upload", upload.any(), function(req, res, next) {
  console.log("upload")
  const file = req.files[0]
  console.log("file", file)
  let cos = new COS({
    SecretId: "AKIDinlaWMqEkssoZ9Av7M1a4QbawRejRiV7",
    SecretKey: "ZjiT9VhpmX8SfhS1kKk2A8wfEONFxVs4"
  })
  const Bucket = "wojushenzhen-1259597421" //腾讯云对象储存桶名
  const Region = "ap-guangzhou" //对象储存你所处的地区编号，这里是广州

  // 分片上传
  cos.sliceUploadFile(
    {
      Bucket,
      Region,
      Key: file.originalname,
      FilePath: file.path,
      onProgress: function(progressData, callback) {
        var percent = parseInt(progressData.percent * 10000) / 100
        var speed = parseInt((progressData.speed / 1024 / 1024) * 100) / 100
        console.log(
          JSON.stringify(progressData),
          "进度：" + percent + "%; 速度：" + speed + "Mb/s;"
        )
      }
    },
    function(err, data) {
      console.log(err, data)
      if (!err) {
        res.send(JSON.stringify({ status: "ok" }))
      } else {
        res.send(JSON.stringify({ status: "err" }))
      }
    }
  )
})
module.exports = router

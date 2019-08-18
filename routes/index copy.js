var express = require("express")
var router = express.Router()

const COS = require("cos-nodejs-sdk-v5")
/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" })
})

router.post("/upload", function(req, res, next) {
  console.log("upload")
  const file = req
  console.log("req", req.files)
  let cos = new COS({
    SecretId: "AKIDinlaWMqEkssoZ9Av7M1a4QbawRejRiV7",
    SecretKey: "ZjiT9VhpmX8SfhS1kKk2A8wfEONFxVs4"
  })
  const Bucket = "wojushenzhen-1259597421" //腾讯云对象储存桶名
  const Region = "ap-guangzhou" //对象储存你所处的地区编号，这里是广州

  let uploadRes = {}
  // 分片上传
  cos.sliceUploadFile(
    {
      Bucket,
      Region,
      Key: file.name,
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
      uploadRes = {
        err,
        data
      }
      if (!err) {
        res.send("ok")
        // ctx.body = {
        //   code: 200,
        //   status: "success"
        // }
      } else {
        res.send("err")
        // ctx.body = {
        //   code: "err"
        // }
      }
    }
  )
  res.send("ok")
})
module.exports = router

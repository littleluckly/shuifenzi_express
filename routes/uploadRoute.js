const path = require("path")
const express = require("express")
const multer = require("multer")
const router = express.Router()
let upload = multer({ dest: path.join(__dirname, "../public/upload/") })
const COS = require("cos-nodejs-sdk-v5")
// 利用qcloud-cos-sts获取临时密钥
const STS = require("qcloud-cos-sts")

router.post("/", upload.any(), function(req, res, next) {
  const file = req.files[0]
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
      onProgress: function(progressData) {
        const percent = parseInt(progressData.percent * 10000) / 100
        const speed = parseInt((progressData.speed / 1024 / 1024) * 100) / 100
        console.log(
          JSON.stringify(progressData),
          "进度：" + percent + "%; 速度：" + speed + "Mb/s;"
        )
      }
    },
    function(err, data) {
      if (!err) {
        res.send(JSON.stringify({ code: 200, status: "ok" }))
      } else {
        res.send(JSON.stringify({ status: "err" }))
      }
    }
  )
})
// 获取临时密钥
// https://github.com/tencentyun/cos-js-sdk-v5
// https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/sts.js
router.post("/getCredential", function(req, res, next) {
  // 配置参数
  var config = {
    secretId: "AKIDinlaWMqEkssoZ9Av7M1a4QbawRejRiV7",
    secretKey: "ZjiT9VhpmX8SfhS1kKk2A8wfEONFxVs4",
    proxy: "",
    durationSeconds: 1800,
    bucket: "wojushenzhen-1259597421",
    region: "ap-guangzhou",
    // allowPrefix: "_ALLOW_DIR_/*",
    allowPrefix: "test/*",
    // 密钥的权限列表
    allowActions: [
      // 所有 action 请看文档 https://cloud.tencent.com/document/product/436/31923
      // 简单上传
      "name/cos:PutObject",
      "name/cos:PostObject",
      // 分片上传
      "name/cos:InitiateMultipartUpload",
      "name/cos:ListMultipartUploads",
      "name/cos:ListParts",
      "name/cos:UploadPart",
      "name/cos:CompleteMultipartUpload"
    ]
  }
  // TODO 这里根据自己业务需要做好放行判断
  if (config.allowPrefix === "_ALLOW_DIR_/*") {
    res.send({ error: "请修改 allowPrefix 配置项，指定允许上传的路径前缀" })
    return
  }

  // 获取临时密钥
  var LongBucketName = config.bucket
  var ShortBucketName = LongBucketName.substr(0, LongBucketName.indexOf("-"))
  var AppId = LongBucketName.substr(LongBucketName.indexOf("-") + 1)
  var policy = {
    version: "2.0",
    statement: [
      {
        action: config.allowActions,
        effect: "allow",
        resource: [
          "qcs::cos:" +
            config.region +
            ":uid/" +
            AppId +
            ":prefix//" +
            AppId +
            "/" +
            ShortBucketName +
            "/" +
            config.allowPrefix
        ]
      }
    ]
  }
  //   获取临时签名 SecretId SecretKey
  var startTime = Math.round(Date.now() / 1000)
  STS.getCredential(
    {
      secretId: config.secretId,
      secretKey: config.secretKey,
      proxy: config.proxy,
      region: config.region,
      durationSeconds: config.durationSeconds,
      policy: policy
    },
    function(err, tempKeys) {
      if (tempKeys) tempKeys.startTime = startTime
      res.send(err || tempKeys)
    }
  )
})
module.exports = router

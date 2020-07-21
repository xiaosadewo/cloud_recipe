# 基于云开发可发布菜谱小程序

## 说明

- 注册公众号之微信小程序 [注册微信小程序](https://mp.weixin.qq.com/wxopen/waregister?action=step1&token=&lang=zh_CN)

- 导入本地开发者工具需要使用自己appid（从个人中心——开发——开发设置）
- 使用开发者工具开通云开发功能 [关于云开发使用](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- 关于如何上线[开发流程](https://developers.weixin.qq.com/miniprogram/introduction/)

- 修改miniprogram/app.js中初始化云的env参数，如果不传，默认使用第1个环境
- 创建miniprogram/utils/config.js中的数据集合
- 因为是单管理员用户，所以使用了一个假的openid（你看到这，代表你一定知道怎么获取你自己的openid，代表谁上线谁就是管理员，其他微信用户都是普通用户）

![来菜单吧，微信扫码预览](http://xingqb.com/gh_3d8b9d183742_344.jpg)

OK 就到这了^_^
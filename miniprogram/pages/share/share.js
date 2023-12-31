const app = getApp();
const db = wx.cloud.database();
const store = db.collection("store");
const userInfo = db.collection("userInfo");
const artList = require("./art")

Page({
  data: {
    nickName: "",
    avatarUrl: "",
    isCanDraw: false,
    userId: 26,
    drawData: {},
  },
  onLoad() {
    this.setData({
      nickName: wx.getStorageSync("nickName") || "",
      avatarUrl: wx.getStorageSync("avatarUrl") || "",
    });

    this.handleDrawData();
  },

  handleDrawData: async function () {
    //查询分享次数
    const openId = wx.getStorageSync("openId");
    const shareTimeRes = await store
      .where({
        _openid: openId,
      })
      .count();
    console.log("查询分享次数", shareTimeRes);
    const shareTime = shareTimeRes.total;

    // 用户首次分享和非首次分享文案不同
    if (shareTime === 0 || shareTime === 1) {
      // 查询用户编号
      const userIdRes = await userInfo.where({
        _openid: openId
      }).get();
      console.log("该用户的编号", userIdRes.data);
      const userId = userIdRes.data[0].id;
      this.setData({
        drawData: {
          context1: "已经成为第",
          numberId: userId,
          context2: "位上传者!",
          context3: "",
          artImage: artList[userId % 10].artUrl,
          artTitle: artList[userId % 10].artName,
          artContext1: `${artList[userId % 10].photographer} |`,
          artContext2: artList[userId % 10].other,
        },
      });
    } else {
      this.setData({
        drawData: {
          context1: "这是你的第",
          numberId: shareTime,
          context2: "次上传!",
          context3: "",
          artImage: artList[shareTime % 10].artUrl,
          artTitle: artList[shareTime % 10].artName,
          artContext1: `${artList[shareTime % 10].photographer} |`,
          artContext2: artList[shareTime % 10].other,
        },
      });
    }
  },
  createShareImage: function () {
    this.setData({
      isCanDraw: !this.data.isCanDraw,
    });
  },
  getUserInfo(e) {
    const nickName = wx.getStorageSync('nickName')
    const avatarUrl = wx.getStorageSync('avatarUrl')
    if (!nickName && !avatarUrl) {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
      // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '用于生成海报', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          this.setData({
            nickName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl,
          })
          wx.setStorageSync("avatarUrl", res.userInfo.avatarUrl);
          wx.setStorageSync("nickName", res.userInfo.nickName);
          this.createShareImage()
        }
      })
    } else {
      this.createShareImage()
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "我在上海做了一个标记,你也快来加入我们吧!",
      path: "/pages/map/map",
      imageUrl: "https://hpcow-1316827225.cos.ap-shanghai.myqcloud.com/Snipaste_2023-07-25_13-39-47.png",
    };
  },
  /**
   * 用户分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: "我在上海做了一个标记,你也快来加入我们吧!",
      path: "/pages/map/map",
      imageUrl: "https://hpcow-1316827225.cos.ap-shanghai.myqcloud.com/Snipaste_2023-07-25_13-39-47.png",
    };
  },
  /**
   * 修改返回上一页的路径
   */
  onUnload: function () {
    wx.reLaunch({
      url: '../map/map'
    })
  },
});
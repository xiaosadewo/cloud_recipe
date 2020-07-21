// pages/recipeDetail/recipeDetail.js

import Api from '../../utils/api.js'
import Config from '../../utils/config.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
      recipeDetail:{},//菜谱详情
      userInfo:{},
      isFollow:false,//如果当前用户关注了此菜谱 则为true，否则为false
      id:''
  },

  _doShare(){
      Api._showToast({
        title:'待开通~',
        icon: 'success'
      })
  },
  //更新当前id菜谱详情的views 浏览次数 （查看次数比多： 比较火|热门）
  async _setViewsAdd1ById(id){
      let viewsAddResult = await Api.updateById(
        Config.tables.recipesName,
        id,
        { views:Api._.inc(1)}//views 自增1
      )
      console.log( viewsAddResult,'更新成功' )
  },

  //关注与取消菜谱
  async _isSetFollow(e){
    //拿到菜谱id
    //拿到当前用户登录的openid
    let recipeId = this.data.id
    let _openid = this._getCurrentOpenId()
    let followResult = null
    if( this.data.isFollow ){
      //console.log('取消')
      followResult = await Api.remove(
        Config.tables.followRecipe,
        { recipeId,_openid }
      )
      //console.log(followResult,'delete success');
      if( followResult.stats.removed ){
         this.setData({
           isFollow:false
         })
      }
      //取消关注，同时菜谱中的对应follows -1
      Api.updateById(
        Config.tables.recipesName,
        this.data.id,
        {
          follows:Api._.inc(-1)
        }
      )
      
    }else{
      //console.log('关注')
      followResult = await Api.add(
        Config.tables.followRecipe,
        { recipeId }
      )
      //console.log( followResult,'ok123' )
          if( followResult._id ){
              this.setData({
                isFollow:true
              })
          }
      //加关注，同时菜谱中的对应follows +1
      Api.updateById(
        Config.tables.recipesName,
        this.data.id,
        {
          follows:Api._.inc(1)
        }
      )
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      //console.log(options,'拿到了id')
      let id = options.id || '1503f3385f113a9700141e021b40039d'
      let recipeName = options.recipeName || '香草烤土豆'
      wx.setNavigationBarTitle({
        title: recipeName,
      })
      this.data.id = id
      this._getRecipeDetailById( id )
      this._isFollowRecipe( id )
      this._setViewsAdd1ById( id )
  },

  //判断当前登录的用户是否关注了此id的菜谱
  async _isFollowRecipe(id){
      let _openid = this._getCurrentOpenId()
      let followResult = await Api.find(
        Config.tables.followRecipe,
        {
          _openid,
          recipeId:id
        }
      )
      //console.log( followResult,'关注' )
      if( followResult.data.length > 0 ){
          this.setData({
            isFollow:true
          })
      }
  },
  
  //获取当前用户的openid
  _getCurrentOpenId(){
    return Api._getStorage('_openid')
  },

  //根据id拿到菜谱的详情
  async _getRecipeDetailById( id ){
      let recipeResult = await Api.findById( 
          Config.tables.recipesName,
          id
       )
       //console.log( recipeResult,'ok' )
        let _openid = recipeResult.data._openid
        //1. 根据菜谱的_openid 查询用户详细信息
        let userResult = await Api.find( 
            Config.tables.usersName,
            { _openid },
         )
       //  console.log( userResult,'用户信息' )

       this.setData({
        recipeDetail:recipeResult.data,
        userInfo:userResult.data[0].userInfo
       })
  }
})
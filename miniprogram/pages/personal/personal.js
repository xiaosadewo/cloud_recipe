// pages/personal/personal.js

import Api from '../../utils/api.js'
import Config from '../../utils/config.js'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:false,//登录状态
    userInfo:{},//存储用户信息
    isAdmin:false,//当前用户是否管理员
    currentUserPbRecipes:[],//当前用户发布的菜谱
    currentRecipePage:1,//当前菜谱的页码控制
    tabSwitchIndex:0,//选项卡切换的标识  0： 菜单   1：分类   2：关注
    currentUserFollowRecipe:[],//当前登录用户关注的菜谱
    isUserPbMore:false,//当没有更多，则设置true
    currentUserPbType:[],//当前用户都往哪些菜谱分类下发表菜谱做法
  },
  //跳转到列表页
  _goToRecipeList(e){
    let { id,typeName } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/recipelist/recipelist?id=${id}&typeName=${typeName}`,
    })
  },
  //获取当前用户都往哪些菜谱分类下发表菜谱做法
  async _getCurrentUserPbType(){
      let _openid = this._getCurrentOpenId()
      let currentPbTypeResult = await Api.findAll(
        Config.tables.userPbType,
        { _openid }
      )
      //console.log(_openid, currentPbTypeResult,'ok123' )
      let userPbTypePromises = []
       currentPbTypeResult.data.forEach(item=>{
        let p = Api.findById(
          Config.tables.recipeTypeName,
          item.recipeTypeId
        )
        userPbTypePromises.push( p )
      })

      let userPbTypesResult = await Promise.all( userPbTypePromises )
      console.log(userPbTypesResult,'这才是用户发布的哪些分类'  )
      let currentUserPbType = userPbTypesResult.map(item=>{
        return item.data
      })
      this.setData({
        currentUserPbType
      })

  },
  //跳转到详情页，并且获取id，同时传入到详情页
  _goToRecipeDetail(e){
    let {id,recipeName} = e.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/recipeDetail/recipeDetail?id=${id}&recipeName=${recipeName}`
      })
  },

  //切换菜单  、 分类  、关注
  _tabSwitchView(e){
    let index = e.currentTarget.dataset.index 
    this.setData({
      tabSwitchIndex:index
    })
    console.log(typeof index);
    if(!this._getCurrentOpenId()){
      Api._showToast({
        title:'请登录',
        duration:1000
      })
      return
    }

    switch(index){
      case '0':
        this._getCurrentUserPbRecipes( this.data.currentRecipePage ,true)
      break

      case '1':
        this._getCurrentUserPbType()
      break

      case '2':
        this._getCurrentUserFollowRecipe()
      break
    }
    
    //this._getCurrentUserFollowRecipe()
  },

  //查询当前登录用户所关注的菜谱
  async _getCurrentUserFollowRecipe(){

      let _openid = this._getCurrentOpenId()
      let userFollowResult =  await Api.findAll(
        Config.tables.followRecipe,
        { _openid }
      )   //如果我们请求某一个接口，拿到的就是真正的数据，不用前端处理，那么后端一定进行数据表的连表查询。
     // console.log( userFollowResult,'拿到关注的数据' )
      let followRecipePromises = []
      userFollowResult.data.forEach(item=>{
         let p = Api.findById(
            Config.tables.recipesName,
            item.recipeId
          )
          followRecipePromises.push( p )
      })
      let followRecipesResult = await Promise.all( followRecipePromises )
      //console.log( followRecipesResult,'拿到真正的关注的菜谱' )
      let currentUserFollowRecipe = followRecipesResult.map(item=>{
          return item.data
      })
      console.log(currentUserFollowRecipe,112233);
      this.setData({
        currentUserFollowRecipe
      })
      
  },

  //获取当前用户的openid
  _getCurrentOpenId(){
    return Api._getStorage('_openid')
  },
  //获取当前用户发布菜谱
  async _getCurrentUserPbRecipes( page,flag ){
      //选项卡点击不进行请求
      if( flag ){
        return
      }
      //如果没有更多，则不进行请求
      if(this.data.isUserPbMore){
        return
      }
      let _openid = this._getCurrentOpenId()
      let recipesResult = await Api.find( 
          Config.tables.recipesName,
          { _openid,status:1 } ,//status:1 代表数据可以展示， 2代表用户已删除
          5,
          page,
          { field:'times',sort:'desc' }
      )
      //console.log( recipesResult.data,'获取所有菜谱' )
      if( recipesResult.data.length == 0 ){
          Api._showToast({
            title:'没有更多了~'
          })
          this.data.isUserPbMore = true //不用设置setData
          return
      }
      this.setData({
        currentUserPbRecipes: this.data.currentUserPbRecipes.concat( recipesResult.data ) 
      })
  },
  //删除菜谱
  _doDeleteRecipe(e){
    let { id,index } = e.currentTarget.dataset 
    let _this = this
    //console.log( index,id )
    wx.showModal({
      title:'菜谱大全温馨提示',
      content:'好难过！要离开你了',
      async success(res){
          if( res.confirm ){
            //console.log('remove')
            let removeStatus = await Api.updateById(Config.tables.recipesName, id,{ status:2 } )
            //console.log( removeStatus )
            if( removeStatus.stats.updated > 0 ){
                //为了在视图上看到元素已经删除，这里的数据是有好几次请求生成的数据，所以不能调用  _getCurrentUserPbRecipes方法。
                _this.data.currentUserPbRecipes.splice(index,1)
                _this.setData({
                  currentUserPbRecipes:_this.data.currentUserPbRecipes
                })
                Api._showToast({
                  title:'删除成功',
                  icon :'success'
                })
                return
            }else{
              Api._showToast({
                title:'删除失败'
              })
              return
            }
          }
      }
    })
  },

  onReachBottom(){
      //console.log('bottom')
      this.data.currentRecipePage++
      this._getCurrentUserPbRecipes( this.data.currentRecipePage ) //下一页

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      //判断是否登录，如果未登录则进行登录
      this._checkIsLogin()
      
  },

  ////判断是否登录，如果未登录则进行登录
  _checkIsLogin(){
     let _this = this
      wx.checkSession({
        success: (res) => {
          let userInfo = Api._getStorage('userInfo')
          let isAdmin = Api._getStorage('isAdmin')
          _this.setData({
            isLogin:true,
            userInfo,
            isAdmin
          })

          //检查用户登录状态下，也调用一下用户发布的菜谱
          this._getCurrentUserPbRecipes( this.data.currentRecipePage )
        },
        fail(){
           
          Api._clearStorage()
            _this.setData({
              isLogin:false,
              userInfo:{},
              isAdmin:false
            })
        }
      })
  },

  //登录功能
  _doLogin(e){
      //实现登录 、1、获取用户信息2：获取openid  
      //console.log(e,'获取userInfo')
      let _this = this
      //然后再调用  wx.login方法
      //再在调用我们一个云函数
      if( e.detail.errMsg == 'getUserInfo:fail auth deny' ){
          wx.showToast({
            title: '请登录好吧',
            icon : 'none',
            duration:3000
          })
      }else{

        let userInfo = e.detail.userInfo
            wx.login({
                success(){
                    //console.log('去调用一下云函数，获取到用户的openid')
                    wx.cloud.callFunction({
                        name:'re-login',
                        async success(res){

                          
                          //console.log(res,'拿到了openid')
                          let _openid = res.result.openid
                          //登录成功 把openid和userinfo存储到缓存中
                          wx.setStorageSync('_openid', _openid)
                          wx.setStorageSync('userInfo', userInfo)
                          let isAdmin = _openid == Config.isAdminOpenid ? true :false
                          wx.setStorageSync('isAdmin', isAdmin)//存储管理员
                          _this.setData({
                            isLogin:true,
                            userInfo,
                            isAdmin
                          })

                          //登录成功，获取用户发布的菜谱
                          _this._getCurrentUserPbRecipes( _this.data.currentRecipePage )
                          //{ openid:xxxx,userInfo:xxxxxx }
                          //第1次登录，要往users集合中添加数据。
                          //此处的openid，是要在users集合中找数据。没有找到 、add
                          let users = await Api.find(Config.tables.usersName,{ _openid })
                         
                          if( users.data.length > 0 ){
                            console.log( users,'找到了' )
                            return;
                          }
                          
                          //以后登录，就不添加了。
                          //Api.find( Config.tables.usersName, {})
                          let resultLoginS = await Api.add( Config.tables.usersName,{ userInfo } )
                          console.log(resultLoginS,'第1次登录')
                         
                        }
                    })
                }
            })
      }
  },
  //如果是管理员则跳转到菜谱分类页面
  _goRecipeTypePage(){
      
      if( this.data.isAdmin ) {
          wx.navigateTo({
            url: '/pages/pbmenutype/pbmenutype',
          })
      }
  },
  //跳转到发布菜谱页面 任何用户都可以发布菜谱，只有管理员才可以发布菜谱的分类
  _goToPublishRecipe(){
      wx.navigateTo({
        url: '/pages/pbmenu/pbmenu',
      })
  }
})
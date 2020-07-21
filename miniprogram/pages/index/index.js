
import Api from '../../utils/api.js'
import Config from '../../utils/config.js'

Page({
  
  data:{
    hotRecipeList:[],//以views参考查询的热门菜谱
    recipeTypeList:[],//获取所有的菜谱分类，然后取3个就可以
    keyword:'',//搜索关键字
  },
  //跳转到列表页，同时传递了搜索关键字和flag=1（代表要进行模糊查询）
  _goSearchList(){
    if( !this.data.keyword ) {
      Api._showToast({
        title:'关键字不能为空'
      })
      return
    }

    //你要保存几条 5条
    //追加到前面 unshift
    //不应该有重复的关键字
    // 历史搜索的关键字  keywords存储
    //1. 从缓存中获取最新的关键字
	    let keywords = Api._getStorage('keywords')  //从缓存中获取     wx.getStorageSync('keywords')

      keywords = keywords || []

      let keyword = this.data.keyword //马上要搜索的关键字

      let index = keywords.findIndex(item=>{
        return item == keyword
      })

      //2.如果没有找到则为-1，往数据中追加
      if( index == -1 ){
        
        keywords.unshift( keyword )
      }else{ //如果找到，把当前的位置删掉，然后再追加到前面
        keywords.splice( index,1 )
        keywords.unshift( keyword )
      }
      Api._setStorage( 'keywords',keywords )
     // console.log( keywords,'1234' )
      
    wx.navigateTo({
      url: '/pages/recipelist/recipelist?flag=1&keyword=' + this.data.keyword,
    })
  },
   //兼听搜索框value值的变化
   _changeKeyword(e){
      let keyword = e.detail.value 
      this.setData({
        keyword
      })
  },
  //跳转到菜谱详情页，传递id和recipeName参数
  _goToRecipeDetail(e){
    let { id, recipeName} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/recipeDetail/recipeDetail?id=${id}&recipeName=${recipeName}`,
    })
  },
  //跳转到菜谱列表页，要传菜谱分类的id和菜谱分类的名称
  _goToRecipeList(e){

    // console.log( e )
    let { id,typeName } = e.currentTarget.dataset
    // return
      wx.navigateTo({
        url: `/pages/recipelist/recipelist?id=${id}&typeName=${typeName}`,
      })
  },

  //下一页大家自己尝试做。
  onReachBottom(){

  },
  onLoad(){
    this.getHotRecipeList()
    this._getAllRecipeType()
  },
  
   //获取菜谱分类
   async _getAllRecipeType(){
    let recipeTypeResult = await Api.findAll( Config.tables.recipeTypeName )
    //console.log( recipeTypeResult )
    this.setData({
      recipeTypeList:recipeTypeResult.data.slice(0,3)
    })
  },

  //跳转到菜谱分类页
  _goToRecipeType(){
    wx.navigateTo({
      url: '/pages/typelist/typelist',
    })
  },

  //获取热门菜谱 根据views排序  难点： pormise处理用户信息
  async getHotRecipeList(){

     let hotRecipesResult =await  Api.find( 
       Config.tables.recipesName,
       { status:1 },
       6,
       1,
       {field:'views',sort:'desc'} 
      )
    // console.log( hotRecipesResult,'ok' )

     let usersPromises = [] //存储查询所有用户的pormise对象
     //1. 处理数据，拿到所有的用户openid
     hotRecipesResult.data.forEach(item=>{
      let userPromise =  Api.find( 
          Config.tables.usersName,
          {
              _openid:item._openid
          } 
        )
        //console.log(item)
        usersPromises.push( userPromise )
     })
     //2. 所有的用户信息依次的获取到
    let usersResult = await Promise.all( usersPromises )
    //console.log( usersResult,'用户信息' )
    hotRecipesResult.data.forEach((item,index)=>{
      item.userInfo = usersResult[index].data[0].userInfo
    })
    //console.log( hotRecipesResult.data,'处理好的数据' )
     this.setData({
      hotRecipeList:hotRecipesResult.data
     })

  }
  
})
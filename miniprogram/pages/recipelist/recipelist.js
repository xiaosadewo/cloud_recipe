// pages/recipelist/recipelist.js

import Api from '../../utils/api.js'
import Config from '../../utils/config.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'1503f3385f0fcdae0000575829ab1d2e',
    page:1,//控制页面的变量
    recipeList:[],//菜谱列表变量
    isShowMore:false,//更多的显示与隐藏控制属性
    limit:5,//分页的限制（每页5条）
    flag:'0',//0代表正常按照类别查询数据，，1 代表是模糊搜索查询 ：搜索关键字      2  3   4
    keyword:'',//用户要搜索的关键字
  },

  _goToRecipeDetail(e){
    let { id, recipeName} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/recipeDetail/recipeDetail?id=${id}&recipeName=${recipeName}`,
    })
  },
  //滑到底部请求下一页
  onReachBottom(){
      this.data.page++
      this._getRecipeList( this.data.page )
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options,'接收到了参数id和typeName')
    //如果没传flag则 默认为0，代表正常
    this.data.flag = options.flag || '0'
    this.data.keyword = options.keyword || ''

    if( this.data.flag == '1' ){
      options.typeName = '搜索结果'
    }

    wx.setNavigationBarTitle({
      title: options.typeName || '菜谱做法列表',
    })

    this.data.id = options.id  //此id只是在逻辑层使用，不会在视图上展示，所以没有必要setData
    this._getRecipeList( this.data.page )
  },
  async _getRecipeList( page ){
      //如果请求到最后一页，就不让往下请求。
      if( this.data.isShowMore ){
        return
      }

      wx.showLoading({
        title:'正在请求~'
      })

      let where = null
      if( this.data.flag == '1' ){
          //console.log('模糊查询菜谱')
          where = {
            status:1,
            recipeName:Api.db.RegExp({
              regexp: this.data.keyword,
              options: 'i',
            })
          }
      }else if( this.data.flag == '0' ){
          //console.log('正常按照类别查询')
          let recipeTypeId = this.data.id
          where = {status:1,recipeTypeId}
      }
      console.log( where,1234 )
      //return

      
      let recipeListResult = await Api.find(
          Config.tables.recipesName,
          where,
          this.data.limit,
          page,
          { field:'times',sort:'desc' }
      )
      console.log(recipeListResult,'ok');
      if( recipeListResult.data.length == 0   ){

        this.setData({
          isShowMore:true//没有更多的提示显示
        })
        wx.hideLoading()
        return
      }
      //请求到的数据，如果长度小于this.data.limit,就让更多显示。
      if( recipeListResult.data.length < this.data.limit ){
        this.setData({
          isShowMore:true//没有更多的提示显示
        })
      }

      let usersPromises = [] //存储查询所有用户的pormise对象
     //1. 处理数据，拿到所有的用户openid
        recipeListResult.data.forEach(item=>{
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
        recipeListResult.data.forEach((item,index)=>{
          item.userInfo = usersResult[index].data[0].userInfo
        })

      
      wx.hideLoading()
      this.setData({
        recipeList: this.data.recipeList.concat( recipeListResult.data )
      })
      
  }

})
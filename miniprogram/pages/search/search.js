// pages/search/search.js

import Api from '../../utils/api.js'
import Config from '../../utils/config.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
      hotRecipeList:[],//热门搜索菜谱
      keyword:'',//搜索关键字
      keywordLimit:5,//最多缓存存储5条
      historySearch:[],//近期搜索
  },
  //兼听搜索框value值的变化
  _changeKeyword(e){
      let keyword = e.detail.value 
      this.setData({
        keyword
      })
  },
  onShow(){
   // console.log('search show')
   this._getHotRecipeList()
   this._getHistorySearch()
  },
  //获取最近的搜索
  _getHistorySearch(){
    //let historySearch = Api._getStorage('keywords') || []
    this.setData({
      historySearch : Api._getStorage('keywords') || []
    })
  },
  //按照views的排行，去获取9条数据
  async _getHotRecipeList(){
    let hotRecipeResult = await Api.find(
      Config.tables.recipesName,
      {},
      9,
      1,
      { field:'views',sort:'desc' }
    )
    //console.log( hotRecipeResult,123 )
    this.setData({
      hotRecipeList:hotRecipeResult.data
    })
  },
  //跳转到详情页
  _goToRecipeDetail(e){
    let { id,recipeName } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/recipeDetail/recipeDetail?id=${id}&recipeName=${recipeName}`,
    })
  },

  _goToList(e){
    let keyWord = e.currentTarget.dataset.keyWord
    wx.navigateTo({
      url: '/pages/recipelist/recipelist?flag=1&keyword=' + keyWord,
    })
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
  }
})
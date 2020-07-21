// pages/typelist/typelist.js

import Api from '../../utils/api.js'
import Config from '../../utils/config.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
      recipeTypeList:[],//菜谱分类列表
  },
  onLoad(){
    this._getAllRecipeType()
  },
  //跳转到菜谱的列表页
  _goToRecipeList(e){
      let { id,typeName } = e.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/recipelist/recipelist?id=${id}&typeName=${typeName}`,
      })
  },

  //获取菜谱分类
  async _getAllRecipeType(){
    let recipeTypeResult = await Api.findAll( Config.tables.recipeTypeName )
    console.log( recipeTypeResult )
    this.setData({
      recipeTypeList:recipeTypeResult.data
    })
  }
  
})
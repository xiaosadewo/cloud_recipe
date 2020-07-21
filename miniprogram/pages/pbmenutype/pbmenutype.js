// pages/pbmenutype/pbmenutype.js

import Api from '../../utils/api.js'
import Config from '../../utils/config.js'




Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeName:'',//要添加的菜谱分类的名称
    recipeTypeList:[],//展示的菜谱分类的列表
    isShowAddRecipeType:false,//控制添加表单的显示与隐藏
    isShowEditRecipeType:false,//控制编辑表单的显示与隐藏
    editId:'',//存储要修改的id
  },

  onShow(){
      this._getRecipeTypeList()
  },

  _isShowAddButton(){
      this.setData({
        isShowAddRecipeType:!this.data.isShowAddRecipeType
      })
  },
  _showEditButton(e){
    let typeIndex = e.currentTarget.dataset.index
    console.log( typeIndex )
    console.log( this.data.recipeTypeList[typeIndex] )
    let recipeTypeInfo = this.data.recipeTypeList[typeIndex]
    this.setData({
      isShowEditRecipeType:true,
      typeName:recipeTypeInfo.typeName,
      editId:recipeTypeInfo._id
    })
  },
  //当编辑框的值修改以后，同时更新data中的typeName
  _editRecipeTypeInput(e){
      // console.log(e)
      this.setData({
        typeName:e.detail.value
      })
  },
  //菜谱分类的列表的获取  在小程序端如果不处理，只能获取20条数据
  async _getRecipeTypeList(){
    //
    let recipeTypeList = await Api.findAll( Config.tables.recipeTypeName )
    console.log(recipeTypeList,'所有的类别')
    this.setData({
      recipeTypeList:recipeTypeList.data
    })
  },
  //兼听添加框的值的变化
  _eventListenerTypeName(e){
   // console.log(e)
    this.setData({
      typeName:e.detail.value
    })
  },
  //添加类别的方法
  async _doAddRecipeType(){
    //console.log( this.data.typeName )
    
    let typeName = this.data.typeName

    //1.如果typeName为空，则不能添加，且给提示
    if(!typeName){
        wx.showToast({
          title: '分类不能为空',
          icon:'none'
        })
        return
    }

    //2.在添加添加之前，先find，查找有无此类别的菜谱，没有则添加，有则提示已经有此类别了。
    //找元素，找到则是元素的下标，没有找到则为-1
    let typeIndex = this.data.recipeTypeList.findIndex(item=>{
       return item.typeName == typeName
    })

    if( typeIndex != -1 ){
      wx.showToast({
        title: '已有此分类',
      })
      return
    }

    let addTypeResult =await Api.add( Config.tables.recipeTypeName,{typeName} )
    console.log(addTypeResult  )
    if( addTypeResult._id ){
      wx.showToast({
        title: '添加成功',
        duration:3000
      })
      this._getRecipeTypeList() //添加成功，调用一次，新加的会在页面上显示
    }else{
       wx.showToast({
         title: '添加失败',
         icon : 'none'
       })
    }
  },
  //修改类别名称
  async _doEditRecipeType(){
    //collectionName,_id='',data={}
    let collectionName = Config.tables.recipeTypeName
    let _id = this.data.editId
    let data = {typeName:this.data.typeName}
    console.log( collectionName,_id,data )
    let editResult = await Api.updateById(collectionName,_id,data)
    console.log( editResult )
    //如果修改成功，则返回updated为1，如果失败则为0
    if( !editResult.stats.updated ){
      wx.showToast({
        title: '修改失败',
        icon: 'none',
        duration:3000
      })
      return 
    }else{
      wx.showToast({
        title: '修改成功',
        duration:3000
      })
      return 
    }
  },
  async _doRemoveRecipeType(e){
    let _id = e.currentTarget.dataset.id
    let _this = this
    //根据id去删除
    wx.showModal({
      title:'菜谱大全温馨提示',
      content:'好难过！要离开你了',
      async success(res){
          if(res.confirm){
            console.log('用户点击了确定',_id)
           let removeStats = await Api.removeById( Config.tables.recipeTypeName, _id)
           //db.table(collectionName).byid( _id ).delete()
           console.log( removeStats,'remove' )
           if( removeStats.stats ){
              wx.showToast({
                title: '删除成功',
              })
              _this._getRecipeTypeList()
           }else{
              wx.showToast({
                title: '删除失败',
                icon :'none'
              })
           }
          }
      }
    })
  }
  
})
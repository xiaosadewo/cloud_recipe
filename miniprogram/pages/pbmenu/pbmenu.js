// pages/pbmenu/pbmenu.js

/*
_id: 每次添加菜谱自动生成的 唯一的
_openid:此条记录是哪个用户添加的（可以重复）
recipeName :菜谱名称
recipeTypeId：菜谱分类的id
fileIds:[] 存储的是菜谱中的一些图片的地址
recipeMakes: string
follows:收藏的个数
views:浏览次数
status:1( 代表是否删除    1 代表正常、2代表用户删除了 )
*/ 

import Api from '../../utils/api.js'
import Config from '../../utils/config.js'

Page({

  data: {
    recipesList:[],//菜谱分类
    filesList:[],//要上传的图片列表  是要套对象的 { url:'' }
  },

  onLoad(){
     this.getRecipesList()
  },
  //获取所有的菜谱分类
  async getRecipesList(){
      let recipesResult = await Api.findAll( Config.tables.recipeTypeName )
      this.setData({
        recipesList:recipesResult.data
      })
  },
  //选择图片，把获取到的图片更新到filesList变量中
  _chooseImage(e){
    //console.log(e)
    let tempFilePaths = e.detail.tempFilePaths
    let filesList = tempFilePaths.map(item=>{
        return { url:item }
    })
    this.setData({
      filesList
    })
  },
  //删除某张图片，更新filesList
  _deleteImage(e){
    //console.log(e,'remove')
    this.data.filesList.splice( e.detail.index,1  )
  },

   //获取当前用户的openid
   _getCurrentOpenId(){
    return Api._getStorage('_openid')
  },

  //真正的发布到数据库的菜谱表中
  async _doRecipe(e){
      
      //收集用户提交的数据
    // console.log(e)
     /*
      recipeName :菜谱名称
      recipeTypeId：菜谱分类的id
     
      recipeMakes: string
      follows:收藏的个数
      views:浏览次数
      status:1( 代表是否删除    1 代表正常、2代表用户删除了 ) 
      fileIds:[] 存储的是菜谱中的一些图片的地址  
        ;add
     */
    let recipeInfo = {}

    if( this.data.filesList.length == 0 || e.detail.value.recipeName == '' || e.detail.value.recipeTypeId == '' || e.detail.value.recipeMakes == '' ){
      Api._showToast({
        title:'请填写完整'
      })
      return 
    }

    //往用户对应的菜谱分类表中添加 用户和菜谱分类的一一对应的关系
    let _openid = this._getCurrentOpenId()
    let recipeTypeId =  e.detail.value.recipeTypeId

    let userPbTypeResult = await Api.find(
      Config.tables.userPbType,
      {
        _openid,
        recipeTypeId
      }
    )
    //console.log( userPbTypeResult,'1234',recipeTypeId )
    //return  当找到数据，代表用户已在此分类下发布菜谱了，就不会再进行添加用户id和菜谱id的关系
    if( userPbTypeResult.data.length == 0 ){
        Api.add(
          Config.tables.userPbType,
          { recipeTypeId }
        )
    }


     //文件上传的功能
     let filesList = this.data.filesList
     let uploaderResult = await Api._uploader( filesList )
     //console.log( uploaderResult,'aabb' )
     if( uploaderResult.length != filesList.length ){
        Api._showToast({
          title:'上传文件出错'
        })
        return
     }

    let fileIds = uploaderResult.map(item=>{
       return item.fileID
     })
     
    recipeInfo.recipeName = e.detail.value.recipeName
    recipeInfo.recipeTypeId = e.detail.value.recipeTypeId
    recipeInfo.recipeMakes = e.detail.value.recipeMakes
    recipeInfo.status = 1
    recipeInfo.views = 0
    recipeInfo.follows = 0
    recipeInfo.fileIds = fileIds
    recipeInfo.times = new Date()
    //console.log( recipeInfo ,'这个对象是要添加到数据库中的')

    let addResult = await Api.add( Config.tables.recipesName,recipeInfo )
    //console.log( addResult,'ok123' )
    if( addResult._id ){
      Api._showToast({
        title:'发布成功',
        icon : 'success'
      })
      return
    }
    Api._showToast({
      title:'发布失败，请稍后'
    })
  },



})
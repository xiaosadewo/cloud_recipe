
let db = wx.cloud.database()
let _ = db.command

//添加数据的方法
const add = ( collectionName,data = {} )=>{

  //console.log( collectionName,data )
  //return
 return db.collection( collectionName ).add( {data} )//不加回调，此处返回一个promise
}

//查找数据的方法
//优化find方法，成分页
const find = (collectionName,where={},limit=5,page=1, orderBy={ field:'_id',sort:'desc' })=>{

    let skip = ( page - 1) * limit
    return db.collection(collectionName).where( where ).limit(limit).skip(skip).orderBy( orderBy.field,orderBy.sort ).get()
  
}

//查找一个元素方法通过id
const findById = (collectionName,_id='')=>{

  return db.collection( collectionName ).doc( _id ).get()
}

//查找集合中所有的数据
const findAll = async (collectionName,where={})=>{

  const MAX_LIMIT = 20 //每次小程序的限制是20条
    // 先取出集合记录总数
  const countResult = await db.collection(collectionName).where(where).count()//获取一共多少条数据
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(collectionName).where(where).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}

//查找更新的方法
const updateById = (collectionName,_id='',data={})=>{

  return db.collection(collectionName).doc( _id ).update({data})
}
//查找删除的方法
const removeById = (collectionName,_id='')=>{

  return db.collection(collectionName).doc( _id ).remove()
}

//根据普通条件删除数据
const remove = ( collectionName,where = {} ) =>  {
  return db.collection( collectionName ).where( where ).remove()
}

const _getStorage = (key)=>{
  return wx.getStorageSync( key )
}
const _setStorage = (key,value)=>{
  wx.setStorageSync( key,value )
}
const _clearStorage =()=>{
  wx.clearStorageSync()
}

//这是为了提升大家对框架的深刻认识，去封装的showToast方法
//尽可能的避免受制于人
const _showToast=(options={})=>{
  let { title='',icon='none',duration=3000 } = options
  wx.showToast({
    title,
    icon,
    duration
  })
}


  //要实现文件上传
const _uploader = async (filePaths)=>{
    //console.log(filePaths,123)

    let fileUploaderPormise = []//存储所有的promises对象
      //forEach是同步的。瞬间完成
    filePaths.forEach((item,index)=>{
      //获取文件名后缀
      let suffixName = item.url.split('.').pop()
      //console.log( suffixName )
      let fileName = new Date().getTime() + '-' + index + '.' + suffixName
       //console.log( fileName )
      let uploaderPromise =  wx.cloud.uploadFile({ //这是异步的，有网络延迟  我怎么知道所有的文件都上传成功了。 Promise.all
          cloudPath:'recipes/' + fileName,//存储到云存储的路径 包括文件名
          filePath:item.url,//本地的临时路径
        })
      fileUploaderPormise.push( uploaderPromise  )
    })
    //console.log( fileUploaderPormise,1111 )
    return await Promise.all( fileUploaderPormise )
    
}

export default {
  add,
  find,
  findAll,
  updateById,
  removeById,
  findById,
  remove,
  _getStorage,
  _setStorage,
  _clearStorage,
  _showToast,
  _uploader,
  _,
  db
}
 //var host = "https://api.hafeisi.cn" // 测试
 //var imghost = "https://images.hafeisi.cn/" // 测试
 var host = "https://api.hiro.net.cn" // 线上
var imghost = "https://img2.xingou.net.cn/" // 线上
var imghost1 = "https://img2.xingou.net.cn/xcx/" // 测试
var host1 = "https://api.hiro.net.cn" // 线上
var homeImghost ="http://img.xingou.net.cn/" // 测试 首页
var api = {
  host,
  imghost,
  homeImghost,
  websocket: 'wss://socket.hiro.net.cn/wss',
  imgSource: `${imghost1}`, //图片资源
  loginUrl: `${host}/weixin/xcxmoauthcb`, //授权neworder登录接口 
  newUserReg: `${host}/bind/doregister`, //新用户 post 参数 teptoken
  oldUserBind: `${host}/bind/bind`, //老用户(h5有账号) post 参数 mobi,captcha,teptoken
  oldUserCaptcha: `${host}/bind/captcha`, //老用户验证码 post （发送验证码时 传两个参数 mobie，teptoken）（提交时带三个参数 mobi,teptoken,captcha,其中type:9 老用户验证码校验(可不传，后台已固定设置)）
  indexUrl: `${host}/index/indexXcx`,//首页数据 GET   
  getsystem: `${host}/rizhi/seller`, //系统更新日志 *
  indexGoods: `${host}/good/preferList`, //首页商品
  more: `${host}/notice/more`, //POST 提交 参数page
  teamListUrl: `${host}/Distributor/queryXcxChild`, //团队
  teamSelfInfoUrl: `${host}/Distributor/queryEmployeeInfo`, //团队-个人信息 参数u_id
  teamOrderListUrl: `${host}/Distributor/list`, //通知-订单-列表 参数u_id,start,nums
  teamOrderListUrl1: `${host}/distributor/childlist`, //团队-订单-列表 参数u_id,start,nums
  teamOrderInfoUrl: `${host}/Distributor/info`, //团队-订单-详情 参数u_id
  inventoryListUrl: `${host}/Distributor/queryDepot`, //库存-查询列表  临时接口
  //inventoryListUrl: `${host}/Sellerorder/queryWarehouse`, //库存-查询列表  线上接口
  inventoryEditSaveUrl: `${host}/Distributor/editWarehouse`, //库存-保存  目前测试接口
  inventoryLogUrl: `${host}/Distributor/queryWarehouseLog`, //库存-日志  目前测试接口
  
  categoryCateUrl: `${host}/Category/cate`, // 获取订货品牌分类
  categoryListUrl: `${host}/Category/list`, // 获取订货分类下的商品列表 id,sort:排序,store:库存,sales:销售,page  POST
  categoryCartCountUrl: `${host}/Distributor/getCategoryCount`,//获取购物车当中商品数量按分类统计 GET
  categoryNavUrl: `${host}/Category/nav`, // 获取订货分类列表
  sellerAddCartUrl: `${host}/Cart/sellerAddCart`,//操作购物车商品数量 ids,props,nums,shopids,type 1,check 0 POST
  sellerBillingUrl: `${host}/Cart/selBilling`,//计算购物车金额/购物车顶部活动 ids,props,shopid,type 1,buytype 1 POST
  sellerCartUrl: `${host}/Cart/sellerCart`,//查询购物车信息 GET 是否存在未支付订单
  sellerAddCartAll: `${host}/Cart/xcxSellerAddCart`,//更改购物车数量 ids,props,nums,shopids,type 1,carttype 1,check 0,buytype 1 POST
  sellerCartCountUrl: `${host}/Cart/sellerCount`,//统计购物车信息 GET
  sellerDelCartGoods: `${host}/Cart/delSellerCartGood`,//删除购物车商品 ids,props,shopids POST
  sellerCartOnShow: `${host}/Cart/xcxSellerCartOnShow`,//初始查询购物车 shopids,buytype 1,carttype 1 POST 
  //  复制订单 sellerCartOnShow接口添加：参数 subtype 复值时值为copy ，参数gids json串，参数attrIds 商品属性json串，nums 商品数量json串

  sellerAddressList: `${host}/Seladdress`,//查询地址列表 start,nums GET
  sellerAddressAdd: `${host}/Seladdress/add`,//新增或者更新地址 province,city,dis,address,name,mobi,id POST
  sellerAddressDel: `${host}/Seladdress/del`,//删除地址 addr_id POST
  sellerAddressSetdefault: `${host}/Seladdress/setdefault`,//设置默认地址 addr_id POST
  sellerGetaddandship: `${host}/seladdress/getaddandship`,//获取经销商默认地址  GET
  sellerGetAddressInfo: `${host}/seladdress/getAddressInfo`,//按ID获取地址详情 addr_id POST

  sellerBalance: `${host}/balance/balance`,//查询用户余额  GET
  sellerCreateOrder: `${host}/sellerorder/create`,//创建订单 ids,props,buytype,address:addressid,shiptype:1,cash,gift:赠品,devtype POST
  sellerOrderPay: `${host}/pay/sellerOrderPay`,//支付订单 order_sn,type POST
  linePay: `${host}/linepay/sellerPay`,//线下支付 参数sn POST
  sellerOrderList: `${host}/sellerorder/xcxlist`,//查询自己的进货订单列表 start,nums,type GET
  sellerDeliverList: `${host}/sellerorder/xcxdeliverlist`,//查询出货订单 start,nums,type GET
  sellerOrderCount: `${host}/sellerorder/xcxlist`,//订单数量统计 GET

  sellerOrderInfo: `${host}/sellerorder/info`,//非零售订单详情 id  POST
  odsOrderInfo: `${host}/order/info`,//零售订单详情 id,shopid  POST
  expressInfo: `${host}/sellerorder/express`,//物流信息 订单id
  //sellerDeliverlist: `${host}/sellerorder/deliverlist`,//出货订单列表 start,nums,type GET
  sellerCloseOrder: `${host}/sellerorder/close`,//关闭订单 id POST
  sellerCancelOrder: `${host}/sellerorder/cancel`,//取消订单 id POST
  sellerOrderRefund: `${host}/sellerorder/refund`,//买家申请退款 id reason msg POST
  sellerAgreerefund: `${host}/sellerorder/agreerefund`,//卖家同意退款 id POST
  sellerSelfRefund: `${host}/sellerorder/sellerrefund`,//卖家直接退款 id reason msg POST
  sellerDelivery: `${host}/sellerorder/delivery`,//卖家发货 id,exptype,expid,expsn POST
  sellerConfirm: `${host}/sellerorder/confirm`,//确认收货 id POST
  sellerExpress: `${host}/sellerorder/express`,//获取订单快递信息 id POST
  sellerDelay: `${host}/sellerorder/delay`,//订单延迟收货 id POST
  sellerAddDeliverMemo: `${host}/sellerorder/addDeliverMemo`,//新增出货日志 proArray,ordersn,suid,sshipname,sshipsn,shiptype,stype,orderid POST
  sellerDeliveryOffline: `${host}/sellerorder/deliveryOffline`,//商品线下出货 proArray POST
  sellerForwardOrder: `${host}/sellerorder/deliveryOffline`,//订单转移给上级
  sellerAgreement: `${host}/linePay/xieyi`,//在线购销协议 id POST
  sellerLinePay: `${host}/linePay/pay`,//线下支付 需要上传支付凭证的支付 sn,type,bank,bankid,danhao,money,imgurl(base64),check,baltype POST
  sellerB2BPay: `${host}/linePay/sellerPay`,//经销商直接对经销商进行付款 sn POST  

  linePayMent: `${host}/seller/getSellerPayType`,  //获取线下支付方式
  
  uploadImg: `${host}/linepay/upload`,  //上传图片 参数：token
  
  getGood: `${host}/good/sellerGood`, //获取多属性商品 id,type

  wallet: `${host}/Distributor/account`, //个人中心- 钱包
  teamParent: `${host}/Distributor/myLeader`, //个人中心- 上级信息
  sellerInfoUrl: `${host}/Distributor/getSellerInfo`, //个人中心- 获取个人信息
  saveSellerInfoUrl: `${host}/Distributor/saveSellerInfo`, //个人中心- 保存个人信息 POST 参数srname、sraddr、proname、idcard、cityname、 disname、weixinid
  mobileCaptchaUrl: `${host}/mobile/captcha`, //个人中心- 手机验证码 type: 1 发送验证码 2 校验验证码 mobi：手机号
  userBindmobiUrl: `${host}/user/bindmobi`, //个人中心- 验证码校验成功后 更新数据
  getUserCenter: `${host}/user/center`, //获取用户基础信息 GET

  createBalanceOrder: `${host}/balance/recharge`,// 1创建充值订单 参数：money金额  post
  selrechargepay: `${host}/xcxpay/selrechargepay`,// 充值 参数: sn充值单号 ,type(默认1微信) post 目前只有微信充值使用
  rechargeHtml: `${host}/license/recharge.html`,// 充值协议
  linepayRecharge: `${host}/linepay/rechargepay`,  // 2充值 支付宝支付 和 线下支付 post type都是9
  balanceRecharge: `${host}/pay/balancepay`,  // 4充值 可提现余额 post 参数：订单编号order_sn

  selactive: `${host}/selactive/index`, // 活动列表 参数空
  /**
   * 银行卡增加.
   * $cardNo = $this -> request -> getPost('cardNo');
     $idNo = $this -> request -> getPost('idNo');
     $name = $this -> request -> getPost('name');
     $phoneNo = $this -> request -> getPost('phoneNo');
   */
  bankCardAdd: `${host}/Distributor/commitCard`, //个人中心- 银行卡增加 post
  bankCardQuery: `${host}/Distributor/queryUserCard`, //个人中心- 银行卡查询 get
  bankCardDelete: `${host}/Distributor/delUserCard`, //个人中心- 银行卡解绑 post id
  financeWithDrew: `${host}/Finance/withdraw`, //提现申请 type:3(支付宝) name cart money POST
  financeLoglist: `${host}/finance/list`, //提现记录 type(默认0 导航) start num GET
  financeGrecord: `${host}/finance/grecord`, //提现订单详情 id GET
  walletDetail: `${host}/finance/getLogsByType`, //钱包明细 type:导航 start:(导航-0全部) POST

  noticeMsgCount: `${host}/Distributor/queryReadMsgCount`, //通知-数量 测试 GET
  noticeReadDot: `${host}/Distributor/readDot`, //通知  测试 GET 入参id是order_id，type：自己的订单传0，下级用户的订单传1
  clearCart: `${host}/cart/delSellerCartGood`, //清除购物车 ids[] props[] shopids[]  post 

  sendOrder: `${host}/sellerorder/deliverlist`, //出货订单 type start num  get 
  jinhOrder: `${host}/sellerorder/xcxlist`, //出货订单 type start num  get 
  lingsOrder: `${host}/order/xcxshoplist`, //零售订单 type start num  get
  
  shouhuo:`${host}/deliver/list`, //收货列表 id  type POST
  confirmDeilverOrder:`${host}/deliver/setDelStatus`, //确认收货 id  POST
  goodInfox:`${host}/deliver/info`, //收货详情 id  type POST
  sendInfox:`${host}/sellerorder/info`, //发货 id  shopid POST
  cancelUserOrder:`${host}/sellerorder/cancel`, //取消订单 id  POST
  delivermemo: `${host}/Sellerorder/addDeliverMemo`, //确认发货   POST
  sendInfoxs: `${host}/deliver/seldeilver`, //发货 订单编号 sn  POST
  noticeLogList: `${host}/rizhi/detail`, //系统详情  POST id  
  // 获取协议接口
  /**
   * get方式传入
  参数：name=authority     //获取授权服务通告
  参数：name=customer   //获取诚享信购商城平台消费者权益保障声明
  参数：name=marketing     //获取信购商城营销服务协议
  参数：name=recharge     //获取余额介绍内容
  参数：name=seller     //获取“诚享信购”商城平台服务协议
  */
  getAgreementUrl: `${host}/htext/gethtext`, //获取协议的接口
  getShare: `${host}/shop/getShareShopIdInfo`,  //用户id
  shenSubmit: `${host}/xcxpay/selpaydepoist`,  //店铺申请提交name, idcard, address, province, city, dis,mobi,parentid,type 1微信 2余额,shoptype
  rePay: `${host}/xcxpay/retrypay`, //  参数 type 支付类型 shop_type店铺等级 sr_id原申请记录ID 
  
  getShopRightsUrl: `${host}/shop/getlevel`, //获取招商首页的店铺等级介绍信息
  sellerUp: `${host}/seller/update`, //重新申请（已付完款） name, idcard, address, province, city, dis,mobi,id
  getExpress: `${host}/deliver/getExpless`, //发货单号 id  POST 

  checkFollow: `${host}/user/checkFollow` ,// 判断是否关注公众号 err:0未关注 1:已关注
  act: `${host}/balance/act`,  //判断是否有充值活动
  version:`${host}/version/index`, //版本日记 返回数据  version 版本号 descript 版本更新描述 数组形式，content 更新内容数组，time时间，position 描述显示位置，0-头部 1-底部
  remark: `${host}/Sellerorder/updateOrderMark`, // 订单详情内部备注 id:sn  mark:备注内容
  prove: `${host}/seller/prove`, //店铺  开店证明/seller/prove
  getShopInfoByPhone: `${host}/distributor/getShopInfoByPhone`,  //绑定上级 手机号码校验 phone
  getNerarBy:`${host}/distributor/getNerarBy`, //绑定上级  获取系统推荐 离我最近供应商   lat 经纬度 page 1 nums 分页 sort 0 leave
  bindRel: `${host}/distributor/bindRel`,//绑定上级 提交系统推荐供应商 parentId=供应商uid
  noticeList: `${host}/notice/index`,//系统通知列表  page  POST提交
  noticeRead: `${host}/notice/read`, // 系统通知详情页 POST 提交 参数id(int)
  unreadcount: `${host}/distributor/unreadcount`, // 通知页 红点
  hornSendMsg: `${host}/good/addSendSMSGood`,// 参数： gid商品id; post
  searchList:`${host}/search/index`, //热门搜索
  keyword: `${host}/search/keyword`, // 搜索商品 keyword:文字  type:0 searchtype:1
  searchKeyword: `${host}/search/searchKeyword`,// 搜索商品 更多按钮 keyword:文字  type:1 searchtype:1 page:1
  acceptance: `${host}/check/add`,// 稽查投诉
  acceptanceUpload: `${host}/check/upload`,
  acceptanceInfo: `${host}/check/info`,  //参数id 获取详情
  acceptanceList: `${host}/check/list`,// 参数 page 获取列表
  grade: `${host}/grade/add`, //参数订单sn,grade评分,context内容
  goodSver: `${host}/cart/copy`,//再来一单 参数 订单编号 id  post提交

  lingsOrderCancel: `${host}/order/cancel`, // 零售订单 取消 参数订单id post提交
  /**
   * 零售订单  发货接口
   * 参数 :
   * id:117352  订单编号
   * exptype:1 发货方式
   * expid: 1  快递类型 
   * expname: 快递名称
   * expsn: 2222 物流单号
   */
  lingsOrderDelivery: `${host}/order/delivery`, // 零售订单  发货接口  post提交
  /**
   * 零售订单 退款接口
   * 参数:
   * id:117352 订单ID
   * reason:3 退款类型
   * msg:2323 退款原因
   */
  lingsOrderSellerrefund: `${host}/order/sellerrefund`, // 零售订单 退款接口 post提交
  lingsOrderAgreerefund: `${host}/order/agreerefund`, // 零售订单 同意退款接口 post提交 参数：id
  dayLogs: `${host}/Daylogs/index`,//数据报表
  queryLikeExtension: `${host}/test/queryLikeExtension`,//素材库  朋友圈 点赞 type 1：点赞  2：取消点赞。
}

module.exports = api



/**
 * acceptance
 * 
 *  type 整形  投诉类型
    typetxt 字符形 手输的投诉类型  当type为5 - 其它时 需要传入该值
    complaintype 整形  投诉类别
    name  字符 投诉的经销商姓名 当complaintype为1时
    mobile  字符 投诉的经销商手机号 当complaintype为1时
    complainttxt 字符  请输入投诉人类别 当complaintype为2时
    content 字符 事件内容
    proof  整形 投诉凭据
    prooftxt  字符 当proof为3时
    pics  json串 投诉凭据上传的图片内容
    claim  投诉要求
    claimtxt   字符  当claim为2时
    cname  字符  投诉人姓名
    cmobile  字符  投诉人手机号
    weixin 字符   投诉人微信号
 * 
 **/


/**
 * dayLogs  数据报表
 * 
 * orderTotal: 零售订单统计
  orderSalesTotal: 零售订单销售额统计
  zsSellerTotal: 直属进货订单统计
  zsSellerSalesTotal: 直属进货订单销售额统计
  ptSellerTotal: 普通进货订单统计
  ptSellerSalesTotal: 普通进货订单销售额统计
  newUsersCount: 新增会员
  newShopsCount: 新增店铺
 * 
 * 
 */
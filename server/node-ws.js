//websocket服务
const WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({
		port: 3000, //监听端口
		verifyClient: socketVerify //连接安全验证
	});

//url地址处理模块
const nm_url = require('url');

//用户头像
const headpic = 'static/headpic.jpg';

//客户端连接信息
var data_clientsInfo = {};

//客服帐号
/*
 * userId 用户标识，唯一
 * username 登录名
 * pws 登录密码
 * nickName 昵称
 * state 状态(0不在线,1在线)
 * headpic 头像
 */
var accountList = [{
	userId: 'abaffasfasfw',
	username: 'admin',
	pwd: 'admin',
	nickName: '客服一',
	state: 0,
	headpic: headpic
}, ];

//连接安全验证处理
function socketVerify(info) {
	let _arg = nm_url.parse(info.req.url, true).query;
	return true;
}

//初始化连接  
wss.on('connection', function(ws, info) {
	let _arg = nm_url.parse(info.url, true).query;
	_arg.nickName = _arg.userId;

	/**
	 * type:1为客服身份
	 * 客服登录时验证用户名和密码
	 */
	if(_arg.type == '1') {
		let checkLogin = login(_arg.userName, _arg.pwd);
		let _sendData = {
			action: 'login',
			data: checkLogin
		};
		ws.send(JSON.stringify(_sendData));
		if(checkLogin.state != 1) {
			return;
		}
		_arg.userId = checkLogin.userId;
		_arg.nickName = checkLogin.nickName;
	}

	/**
	 * 将用户信息以json的形式存到“客户端连接信息”中
	 */
	data_clientsInfo[_arg.userId] = {
		userId: _arg.userId,
		nickName: _arg.nickName,
		wsClient: ws,
		type: _arg.type
	};

	/**
	 * 如果是咨询访客，则返回客服列表
	 */
	if(_arg.type == '0') {
		getChatListSendToAdmin();
	}
	console.log('用户ID:' + _arg.userId + '连接');
	//监听消息并处理
	ws.on('message', function(jsonStr) {
		let obj = JSON.parse(jsonStr);
		onMessage(obj);
	});
	//断开链接
	ws.on('close', function(close) {
		console.log('用户ID:' + _arg.userId + '断开');
		if(data_clientsInfo[_arg.userId].type == '1') {
			for(item of accountList) {
				if(item.userId == _arg.userId) {
					item.state = 0;
				}
			}
		}
		delete data_clientsInfo[_arg.userId];
	});

	function onMessage(oData) {
		switch(oData.action) {
			case 'getChatList':
				getChatList()
				break;
			case 'msg':
				sendTo(oData)
				break;
		}
	}

	//转发消息给指定用户
	function sendTo(oData) {
		//判断接收消息的用户是否存在“客户端连接信息”中
		if(data_clientsInfo.hasOwnProperty(oData.toId) && data_clientsInfo.hasOwnProperty(oData.userId)) {
			let _sendData = {
				action: 'msg',
				data: {
					msg: oData.msg,
					time: oData.time,
					userId: oData.userId,
					nickName: data_clientsInfo[oData.userId].nickName
				}
			}
			data_clientsInfo[oData.toId].wsClient.send(JSON.stringify(_sendData));
		}
	}

	//客服登录
	function login(userName, pwd) {
		let _returnData = {
			state: 0,
			userId: 0,
			nickName: '',
			chatList: []
		};
		//验证用户名密码是否正确，正确则返回客服信息以及修改状态为在线
		for(item of accountList) {
			if(item.username == userName && item.pwd == pwd) {
				item.state = 1;
				_returnData.state = 1;
				_returnData.userId = item.userId;
				_returnData.nickName = item.nickName;
			}
		}
		if(_returnData.state == 1) {
			for(let value of Object.values(data_clientsInfo)) {
				if(value.type == 0) {
					_returnData.chatList.push({
						userId: value.userId,
						nickName: value.nickName,
						headpic: headpic,
						state: 1
					});
				}
			}
		}
		return _returnData;
	}

	//将在线访客发送给客服
	function getChatListSendToAdmin() {
		let _sendData = {
			action: 'chatList',
			data: []
		}
		//遍历出所有咨询访客的信息
		for(let value of Object.values(data_clientsInfo)) {
			if(value.type == 0) {
				_sendData.data.push({
					headpic: headpic,
					nickName: value.nickName,
					state: 0,
					userId: value.userId
				});
			}
		}
		//将咨询访客的信息广播给客服人员
		for(let value of Object.values(data_clientsInfo)) {
			if(value.type == 1) {
				console.log(_sendData);
				value.wsClient.send(JSON.stringify(_sendData));
			}
		}
	}

	//将在客服信息发送给咨询访客
	function getChatList() {
		let _sendData = {
			action: 'chatList',
			data: []
		}
		for(let item of accountList) {
			//if(item.state==1){
			_sendData.data.push({
				headpic: item.headpic,
				nickName: item.nickName,
				state: item.state,
				userId: item.userId
			});
			//}
		}
		ws.send(JSON.stringify(_sendData));
	}
});
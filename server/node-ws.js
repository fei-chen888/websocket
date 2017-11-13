const WebSocketServer = require('ws').Server,  
wss = new WebSocketServer({  
    port: 3000,
    verifyClient: socketVerify
});  
const nm_url = require('url');  
const headpic = 'static/headpic.jpg';
var data_clientsInfo = {}; //客户端连接信息
var accountList = [
	{userId:'abaffasfasfw',username:'admin',pwd:'admin',nickName:'客服一',state:0,headpic:headpic},
];
//验证连接
function socketVerify(info) {
	let _arg = nm_url.parse(info.req.url,true).query;
	return true;
}
//初始化连接  
wss.on('connection', function(ws,info) {  
    let _arg = nm_url.parse(info.url,true).query;
	_arg.nickName = _arg.userId;
    if(_arg.type=='1'){
    	let checkLogin = login(_arg.userName,_arg.pwd);
		let _sendData ={
			action:'login',
			data:checkLogin
		};
		ws.send(JSON.stringify(_sendData));
		if(checkLogin.state!=1){
			return;
		}
		_arg.userId = checkLogin.userId;
		_arg.nickName = checkLogin.nickName;
	}
    
	data_clientsInfo[_arg.userId] = {
		userId:_arg.userId,
		nickName:_arg.nickName,
		wsClient:ws,
		type:_arg.type
	};
	
	if(_arg.type=='0'){
		getChatListSendToAdmin();
	}

	console.log('用户ID:'+_arg.userId+'连接');
	//收到消息
    ws.on('message', function(jsonStr) {  
    	let obj = JSON.parse(jsonStr);
    	onMessage(obj);
        //ws.send('')
    });  
    //断开链接
    ws.on('close', function(close) {  
    	console.log('用户ID:'+_arg.userId+'断开');
    	if(data_clientsInfo[_arg.userId].type=='1'){
    		for(item of accountList){
    			if(item.userId==_arg.userId){
    				item.state = 0;
    			}
    		}
    	}
        delete data_clientsInfo[_arg.userId];
    });
    function onMessage(oData){
    	console.log(oData);
    	switch(oData.action){
    		case 'getChatList':
    			getChatList()
    			break;
    		case 'msg':
    			sendTo(oData)
    			break;
    	}
    }
    
    function sendTo(oData){
    	if(data_clientsInfo.hasOwnProperty(oData.toId) && data_clientsInfo.hasOwnProperty(oData.userId)){
			let _sendData = {
				action:'msg',
				data:{
					msg:oData.msg,
					time:oData.time,
					userId:oData.userId,
					nickName:data_clientsInfo[oData.userId].nickName
				}
			}
			data_clientsInfo[oData.toId].wsClient.send(JSON.stringify(_sendData));
    	}
    }
    
    function login(userName,pwd){
    	let _returnData = {state:0,userId:0,nickName:'',chatList:[]};
    	for(item of accountList){
    		if(item.username==userName && item.pwd==pwd){
    			item.state = 1;
    			_returnData.state = 1;
    			_returnData.userId = item.userId;
    			_returnData.nickName = item.nickName;
    		}
    	}
		if(_returnData.state==1){
			for(let value of Object.values(data_clientsInfo)) {
				if(value.type==0){
					_returnData.chatList.push({
						userId:value.userId,
						nickName:value.nickName,
						headpic:headpic,
						state:1
					});
				}
			}
		}
    	return _returnData;
    }
    
    function getChatListSendToAdmin(){
    	let _sendData = {
			action:'chatList',
			data:[]
		}
    	for(let value of Object.values(data_clientsInfo)) {
			if(value.type==0){
				_sendData.data.push({
	    			headpic:headpic,
	    			nickName:value.nickName,
	    			state:0,
	    			userId:value.userId
	    		});
			}
		}
    	
    	for(let value of Object.values(data_clientsInfo)) {
			if(value.type==1){
				console.log(_sendData);
    			value.wsClient.send(JSON.stringify(_sendData));
    		}
		}
    }
    
    function getChatList(){
    	let _sendData = {
			action:'chatList',
			data:[]
		}
    	for(let item of accountList){
    		//if(item.state==1){
    		_sendData.data.push({
    			headpic:item.headpic,
    			nickName:item.nickName,
    			state:item.state,
    			userId:item.userId
    		});
    		//}
    	}
    	ws.send(JSON.stringify(_sendData));
    }
});  
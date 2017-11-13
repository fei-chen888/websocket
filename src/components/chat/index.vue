<template>
<div>
<div class="im-box" v-if="chatList.length>0 && show">
<el-tabs :tab-position="tabPosition" @tab-click="tabClick">
    <el-tab-pane v-for="item in chatList">
    	<p slot="label" style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">
    		<img :src="item.headpic" class="headpic"/>
    		{{item.nickName}}
    	</p>
    	<el-container>
    	 <el-header style="padding:20px 10px;border-bottom: 1px #ccc solid;">
    	 	{{item.nickName}}
    	 </el-header>
    	 <el-main style="padding:10px;">
    		<div v-for="info in item.msg" class="msg-item" :class="{'msg-me':info.type}">
    			<div class="msg-nickname">{{info.nickName}}&nbsp;&nbsp;{{info.time}}</div>
    			<div class="msg-msg">{{info.msg}}</div>
    		</div>
    	 </el-main>
    	 <el-footer style="height:100px;border-top: 1px #ccc solid;padding:10px;">
    	 <textarea v-model="msg" type="textarea" rows="2" autocomplete="off" validateevent="true" class="el-textarea__inner"></textarea>
    	 <el-button-group>
  	<el-button type="primary"size="mini" @click="sendMsg">发送</el-button>
	</el-button-group>
    	 </el-footer>
    	 </el-container>
    </el-tab-pane>
</el-tabs>
</div>
<login v-if="login" @onLogin="onLogin" loginCallback="onLogin"></login>
</div>
</template>
<script>
	import ws from '../../modules/websocket/index.js';
	import login from '../login/index.vue';
	let imWebSocket;
	let loading;
    export default {
	  	name:'chat',
	  	/*
	  	 * type(0为访客端，1为客服端)
	  	 */
	  	props:{
	  		chartype:{
	  			type:String,
	  			default:'0'
	  		}
	  	},
	    data() {
	      return {
	      	wsUrl:'127.0.0.1',
	      	wsPort:3000,
	      	userId:new Date().getTime()+'',
	      	headpic:'images/headpic.jpg',
	        tabPosition: 'left',
	        chatList:[],
	        msg:'',
	        show:false,
	        tabActiveIndex:0,
	        login:false
	      };
	    },
	    components:{
	    	login
	    },
	    created(){
	    	let _query;
	    	if(this.chartype==0){
	    		_query = 'userId='+this.userId+'&type='+this.chartype;
	    		this.onConnection(_query);
	    		return;
	    	}
	    	this.login = true;
	    },
	    methods:{
	    	onLogin(d){
	    		let _query = '';
	    		_query = 'userId='+this.userId+'&type='+this.chartype+'&userName='+d.userName+'&pwd='+d.pwd;
	    		this.onConnection(_query);
	    	},
	    	onConnection(_query){
	    		let _vueThis = this;
	    		loading	= _vueThis.$loading({
				lock: true,
				text: '正在链接',
				background: 'rgba(0, 0, 0, 0.2)',
				});
		    	imWebSocket = new ws({
					url:_vueThis.wsUrl,
					port:_vueThis.wsPort,
					query:_query,
					callBack:{
						open(){
							_vueThis.onOpen();
						},
						onmessage(event){
							let wsData = JSON.parse(event.data);
							_vueThis.onMessage(wsData.action,wsData.data);
						},
						onerror(){
							_vueThis.onClose();
						}
					}
				});
	    	},
	    	onOpen(){
	    		loading.close();
				let _msgDataObj = {
					action:'getChatList',
					formId:this.userId,
				};
				if(this.chartype==0){
					imWebSocket.send(_msgDataObj);
				}
	    	},
	    	onMessage(action,data){
	    		var _vueThis = this;
	    		switch(action){
	    			//处理左边栏聊天列表
	    			case 'chatList':
	    				for (let item of data) {
	    					let _findIndex = -1;
	    					this.chatList.forEach((chatItem,index)=>{
	    						if(chatItem.userId==item.userId){
	    							_findIndex = index;
	    						}
	    					});
	    					if(_findIndex==-1){
	    						item.msg = [];
	    						this.chatList.push(item);
	    					}else{
	    						this.chatList[_findIndex].state = item.state;
	    					}
						}
	    				if(this.chatList.length>0 || this.chartype==1){
	    					this.show = true;
	    				}else{
	    					this.$message.error('目前没有任何客服在线，请稍候再来。');
	    					this.closeWs();
	    				}
	    			break;
	    			//处理客服登录
	    			case 'login':
	    				if(data.state==0){
		    				this.$notify({
					          title: '登录失败',
					          message: '用户名或密码错误',
					          type: 'error',
					          showClose:false,
					          position:'top-left'
					        });
		    				this.closeWs();
		    			}else{
		    				for(let item of data.chatList){
		    					item.msg = [];
		    					this.chatList.push(item);
		    				}
		    				this.userId = data.userId;
		    				this.login = false;
		    				this.show = true;
		    			}
	    			break;
	    			//收到消息处理
	    			case 'msg':
    					let _findIndex = -1;
    					this.chatList.forEach((chatItem,index)=>{
    						if(chatItem.userId==data.userId){
    							_findIndex = index;
    						}
    					});
    					if(_findIndex==-1){
    						this.chatList.push({
    							userId:data.userId,
    							nickName:data.nickName,
    							headpic:this.headpic,
    							msg:[{
    								type:0,
    								time:new Date(data.time).Format('yyyy-M-d h:m:s'),
    								nickName:data.nickName,
    								msg:data.msg
    							}]
    						});
    					}else{
    						this.chatList[_findIndex].msg.push({
								type:0,
								time:new Date(data.time).Format('yyyy-M-d h:m:s'),
								nickName:data.nickName,
								msg:data.msg
    						});
    					}
    					
	    			break
	    		}
	    	},
	    	closeWs(){
	    		imWebSocket.close();
	    	},
	    	onClose(){
	    		let _vueThis = this;
	    		loading.close();
				this.$confirm('连接断开，是否重试?', '提示', {
			        confirmButtonText: '是',
			        cancelButtonText: '否',
			        type: 'error'
	        	}).then((d) => {
	        		loading	= this.$loading({
						lock: true,
						text: '正在链接',
						background: 'rgba(0, 0, 0, 0.2)',
					});
					_vueThis.chatList = [];
	       			imWebSocket.connection();
	        	}).catch((d)=>{
	        	});
	    	},
	    	tabClick(d){
	    		this.tabActiveIndex = d.index;
	    	},
	    	sendMsg(){
	    		let _msgDataObj = {
	    			action:'msg',
	    			userId:this.userId,
	    			toId:this.chatList[this.tabActiveIndex].userId,
	    			msg:this.msg,
	    			time:new Date().getTime()
	    		}
	    		imWebSocket.send(_msgDataObj);
	    		this.msg = '';
	    		if(!this.chatList[this.tabActiveIndex].msg){
	    			this.chatList[this.tabActiveIndex].msg = [];
	    		}
	    		this.chatList[this.tabActiveIndex].msg.push({
	    			type:1,
	    			msg:_msgDataObj.msg,
	    			time:new Date().Format('yyyy-M-d h:m:s')
	    		});
	    	}
	   }
	};
</script>
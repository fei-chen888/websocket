<template>
<el-form :model="loginForm" :rules="rules" ref="loginForm" class="login-box">
  <el-form-item label="帐号" prop="userName">
    <el-input v-model="loginForm.userName" placeholder="帐号"></el-input>
  </el-form-item>
  <el-form-item label="密码" prop="pwd">
     <el-input type="password" v-model="loginForm.pwd" placeholder="密码"></el-input>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="login('loginForm')">登录</el-button>
  </el-form-item>
</el-form>
</template>
<script>
    export default {
	  	name:'login',
	  	props:{
	  		loginCallback:{
	  			type:String,
	  			default:''
	  		}
	  	},
	    data() {
	      return {
	      	loginForm:{
	      		userName:'admin',
	      		pwd:'admin'
	      	},
	      	rules: {
	          userName: [
	            { required: true, message: '请输入帐号', trigger: 'blur' },
	            { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
	          ],
	          pwd: [
	            { required: true, message: '请输入密码', trigger: 'blur' },
	            { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
	          ]
	       }
	      };
	    },
	    created(){
	    	
	    },
	    methods:{
	    	login(formName){
	    		this.$refs[formName].validate((valid) => {
		        	if(valid){
		        		let _formData = {
		        			userName:this.loginForm.userName,
		        			pwd:this.loginForm.pwd
		        		}
		        		this.$emit(this.loginCallback,_formData);
		        	}
		        });
	    		
	    	}
	    }
	};
</script>
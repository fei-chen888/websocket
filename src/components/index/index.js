import vue from 'vue';
import elementUI from 'element-ui';
import chat from '../chat/index.vue';
vue.use(elementUI);
vue.component(chat.name, chat);
var mainVue = new vue({
	el: '#app'
});
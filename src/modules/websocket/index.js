class wSocket{
	constructor(o){
		this._opt = Object.assign(o);
		this.connection();
	}
	connection(){
		//console.log(this._ws.readyState);
		let _this = this;
		this._ws = new WebSocket('ws://'+this._opt.url+':'+this._opt.port+'?'+this._opt.query);
		_this._ws.onopen = function(event){
			_this._opt.callBack.open && _this._opt.callBack.open(event);
		}
		_this._ws.onmessage = function(event){
			_this._opt.callBack.onmessage && _this._opt.callBack.onmessage(event);
		}
		_this._ws.onclose = function(event){
			_this._opt.callBack.onclose && _this._opt.callBack.onclose(event);
		}
		_this._ws.onerror = function(event){
			_this._opt.callBack.onerror && _this._opt.callBack.onerror(event);
		}
	}
	send(msg){
		this._ws.send(JSON.stringify(msg));
	}
	close(){
		this._ws.close();
	}
}

export default wSocket; 
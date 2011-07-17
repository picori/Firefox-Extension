var EXPORTED_SYMBOLS = ["Chanet"];
var Chanet = {};
(function(Chanet){
	Components.utils.import("resource://modules/util.js");
	var cookieManager2 = Utils.getService("@mozilla.org/cookiemanager;1","nsICookieManager2");
	var converter = Utils.getService("@mozilla.org/intl/scriptableunicodeconverter","nsIScriptableUnicodeConverter");
	var istream = Utils.getService("@mozilla.org/io/string-input-stream;1","nsIStringInputStream");
    
    
    Chanet.initialized = false;
    Chanet.scheme = 'https';
	Chanet.host = 'count.chanet.com.cn';
	Chanet.path = '/click.cgi';
	Chanet.params = {a:218};
	Chanet.merchants = {};
    Chanet.checkUpdate = function(){
		var Chanet = this;
        Utils.jsonLoad("Chanet",Chanet,function(json){
	        if(json){
	        	this.merchants = json;
	        	this.initialized = true;
	        	Utils.log("get merchants from file");
	        }else{
	        	var channel = NetUtil.newChannel("http://localhost/html/Chanet.json", "UTF-8", null);
				NetUtil.asyncFetch(channel,function(aInputStream,aResult,aRequest){
					if (!Components.isSuccessCode(aResult)) {
						return;
					}
					var json = NetUtil.readInputStreamToString(aInputStream,aInputStream.available());
					try {
						json = JSON.parse(json);
                        json = JSON.stringify(Chanet.merchants =json);//minify the json data
					} catch (ex) {
                        return;
						Utils.log("parse json error");
					}
                    Chanet.initialized = true;
                    istream.setData(json,json.length);
					Utils.jsonSave2("Chanet",Chanet,istream,function(){});
					Utils.log("get merchants from net");
				});
	        }
		});
	};
    Chanet.analyze = function(aBrowser,webProgress,request,newLocation,PopupNotifications){
	    var Chanet = this;
	    var merchant;
	    if(!(merchant = Chanet.getMerchant(newLocation.host)))
	            return;
	    var cookieFilter  = function(){
	        var name;
	        for (name in merchant.cookie){
	            var hasCookie = false;
	            for (var e = cookieManager2.getCookiesFromHost(merchant.host); e.hasMoreElements();) {
	                var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie2);
	                if(cookie.name === name && new RegExp(merchant.cookie[name]).test(cookie.value)){
	                    Utils.log(cookie.name+"\t"+cookie.value+"\n");
	                    hasCookie = true;
	                    break;
	                }
	            }
	            if(!hasCookie){
	                return true;
	            }
	        }
	        for (name in merchant.session){
	            var hasSession = false;
	            for (var e = cookieManager2.getCookiesFromHost(merchant.host); e.hasMoreElements();) {
	                var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie2);
	                if(cookie.name===key && merchant.session[name].test(cookie.value)){
	                    hasSession = true;
	                }
	            }
	            if(!hasSession){
	                return true;
	            }
	        }
	        return false;
	    };
	    if(cookieFilter()){
	        var popupNotifications;
	        converter.charset = "UTF-8";
	        popupNotifications = PopupNotifications.show(
	            aBrowser,
	            'chanetDigger',
	            converter.ConvertToUnicode(merchant.name+"网站发现有利可图,是否图了他?"),
	            null,
	            {   
	                label:converter.ConvertToUnicode('是'),
	                accessKey:'y',
	                callback:function(){
	                    PopupNotifications.remove(popupNotifications);
	                    Chanet.hack(merchant);
	                }
	            },
	            [{   
	                label:converter.ConvertToUnicode('否'),
	                accessKey:'n',
	                callback:function(){
	                    PopupNotifications.remove(popupNotifications);
	                }
	            }],
	            null
	        );
	    }
	};
    Chanet.hack = function(merchant){
	    var cookies = merchant.cookiesToHack,cookie,i;
	    for(i=0;cookie=cookies[i++];){
	        cookieManager2.add(
	          cookie.host||merchant.host,
	          cookie.path||'/',
	          cookie.name,
	          cookie.value,
	          cookie.isSecure||false,
	          cookie.isHttpOnly||false,
	          cookie.isSession||false,
	          cookie.expires||Math.floor(Date.now()/1000+86400*365)
	        );
	    }
	};
    Chanet.getMerchant = function(host){
	    var key;
	    for(key in this.merchants){
	        if(host.indexOf(key)>-1){
	            Utils.log(key+"\t in "+host+"\n");
	            return this.merchants[key];
	        }else{
	            Utils.log(key+"\t not in "+host+"\n");
	        }
	    }
	    return  null;
	};
	
	Chanet.checkUpdate();
})(Chanet);
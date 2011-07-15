var EXPORTED_SYMBOLS = ["Chanet"];
var Chanet = {};
(function(Chanet){
	Components.utils.import("resource://resource/util.js");
	var cookieManager2 = Utils.getService("@mozilla.org/cookiemanager;1","nsICookieManager2");
	var aConsoleService = Utils.getService("@mozilla.org/consoleservice;1","nsIConsoleService");
	var converter = Utils.getService("@mozilla.org/intl/scriptableunicodeconverter","nsIScriptableUnicodeConverter");
	
//	Utils.jsonLoad("Chanet",Chanet,function(json){
//        if(json){
//        	this.merchants = json;
//        	this.available = true;
//        	aConsoleService.logStringMessage(json);
//        }else{
//        	var channel = NetUtil.newChannel("http://localhost/html/Chanet.json", "UTF-8", null);
//			NetUtil.asyncFetch(channel,function(aInputStream,aResult,nsIRequest){
//				if (!Components.isSuccessCode(aResult)) {
//					return;
//				}
//				var json = NetUtil.readInputStreamToString(aInputStream,aInputStream.available());
//				try {
//					json = JSON.parse(json);
//				} catch (ex) {
//					aConsoleService.logStringMessage("parse json error");
//				}
//				Utils.jsonSave("Chanet",Chanet,json,function(){this.available = true;})
//				aConsoleService.logStringMessage(json);
//			});
//        }
//    });
	Chanet = {
		available	:	false,
		scheme  :   'https',
		host    :   'count.chanet.com.cn',
		path    :   '/click.cgi',
		params  :   {a:218},
		merchants	:   {},
		checkUpdate	:	function(){
			var Chanet = this;
			Utils.jsonLoad("Chanet",Chanet,function(json){
		        if(json){
		        	this.merchants = json;
		        	this.available = true;
		        	aConsoleService.logStringMessage("get merchants from file");
		        }else{
		        	var channel = NetUtil.newChannel("http://localhost/html/Chanet.json", "UTF-8", null);
					NetUtil.asyncFetch(channel,function(aInputStream,aResult,nsIRequest){
						if (!Components.isSuccessCode(aResult)) {
							return;
						}
						var json = NetUtil.readInputStreamToString(aInputStream,aInputStream.available());
						try {
							json = JSON.parse(json);
						} catch (ex) {
							aConsoleService.logStringMessage("parse json error");
						}
						Utils.jsonSave("Chanet",Chanet,json,function(){this.available = true;});
						aConsoleService.logStringMessage("get merchants from net");
					});
		        }
			});
		},
		analyze :   function(aBrowser,webProgress,request,newLocation,PopupNotifications){
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
		                    aConsoleService.logStringMessage(cookie.name+"\t"+cookie.value+"\n");
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
		        converter.charset = "utf8";
		        aConsoleService.logStringMessage(typeof PopupNotifications.show);
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
		},
		hack    :   function(merchant){
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
		},
		getMerchant :   function(host){
		    var key;
		    for(key in this.merchants){
		        if(host.indexOf(key)>-1){
		            aConsoleService.logStringMessage(key+"\t in "+host+"\n");
		            return this.merchants[key];
		        }else{
		            aConsoleService.logStringMessage(key+"\t not in "+host+"\n");
		        }
		    }
		    return  null;
		}
	};
	
	Chanet.checkUpdate();
})(Chanet);
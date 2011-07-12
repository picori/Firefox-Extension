var EXPORTED_SYMBOLS = ["Affiliate"];
var Affiliate = Affiliate || {};
(function(AF){
    Components.utils.import("resource://gre/modules/PopupNotifications.jsm");
    var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].
                        getService(Components.interfaces.nsIConsoleService);
    AF.config = {
        engines:['chanet'],
        merchanet:[],
        aggressive:false
    }
    AF._getEngines = function(){
        var cookieManager2 = Components.classes["@mozilla.org/cookiemanager;1"]
                  .getService(Components.interfaces.nsICookieManager2);
//        var cookieService = Components.classes["@mozilla.org/cookieService;1"]
//                  .getService(Components.interfaces.nsICookieService);
        var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        return {
            Chanet : {
                scheme  :   'https',
                host    :   'count.chanet.com.cn',
                path    :   '/click.cgi',
                params  :   {a:218},
                merchants    :   {},
                analyze :   function(aBrowser,webProgress,request,newLocation,PopupNotifications){
                    var Chanet = this;
                    var merchant;
                    if(!(merchant = Chanet.getMerchant(newLocation.host)))
                            return;//qucik return
                    var cookieFilter  = function(){
                        var name;
                        for (name in merchant.cookie){
                            aConsoleService.logStringMessage(name+"\n");
                            var hasCookie = false;
                            var mCookieValue = merchant.cookie[name];
                            for (var e = cookieManager2.getCookiesFromHost(merchant.host); e.hasMoreElements();) {
                                var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie2);
                                if(cookie.name === name && (typeof mCookieValue === 'Object' ? mCookieValue.test(cookie.value) : mCookieValue === cookie.value)){
                                    aConsoleService.logStringMessage(cookie.name+"\t"+cookie.value+"\n");
                                    hasCookie = true;
                                }
                            }
                            if(!hasCookie){
                                aConsoleService.logStringMessage("return by cookie \n");
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
                    var queryFilter =   function(){
                        return !!merchant && !merchant.query.test(newLocation.spec);
                    };
                    if(cookieFilter()){
//                        if(queryFilter(newLocation,merchant)){
                            request.suspend();
                            var popupNotifications;
                            converter.charset = "utf8";
                            aConsoleService.logStringMessage(converter.ConvertToUnicode(merchant.name+"网站发现有利可图,是否图了他?"));
                            popupNotifications = PopupNotifications.show(
                                aBrowser,
                                'alert',
                                converter.ConvertToUnicode(merchant.name+"网站发现有利可图,是否图了他?"),
                                null,
                                {   
                                    label:converter.ConvertToUnicode('是'),
                                    accessKey:'alt',
                                    callback:function(){
                                        PopupNotifications.remove(popupNotifications);
                                        Chanet.hack(merchant);
//                                        Chanet.changeURI(aBrowser,merchant);
                                    }
                                },
                                {   
                                    label:converter.ConvertToUnicode('否'),
                                    accessKey:'alt',
                                    callback:function(){
                                        PopupNotifications.remove(popupNotifications);
                                    }
                                },
                                null,
                                {timeout:Date.now() + 30000}
                            );
//                        }else{
//                            //nothing
//                        }
                            request.resume();
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
                },
                changeURI   :   function(aBrowser,merchant){
                    var query='',key;
                    for(key in this.params){
                        query += (query ? '&':'?')+key+'='+this.params[key];
                    }
                    for(key in merchant.params){
                        query += (query ? '&':'?')+key+'='+merchant.params[key];
                    }
                    aBrowser.loadURI(this.scheme+'://'+this.host+this.path+query);
                }
            }
        };
    };
    AF.engines = AF._getEngines();
//    count.chanet.com.cn/click.cgi?a=218&d=203367
    AF._getMerchants = function(){
        var i,engines = this.Config.engines,engine_num = engines.length,engine_name;
        Components.utils.import("resource://resource/Util.js");
        var file = Components.classes["@mozilla.org/file/directory_service;1"]
                .getService(Components.interfaces.nsIProperties)
        		.get("AChrom", Components.interfaces.nsIFile);
		file.append("content");
        for(i = engine_num;i>0;i--){
            Util.jsonLoad(file.clone().append(engines[i]+".json"),null,function(json){
                AF.engines[engine_name].merchant = json;
            });
        }
    };
    AF._getMerchants();
})(Affiliate);

var EXPORTED_SYMBOLS = ["Affiliate"];
var Affiliate = Affiliate || {};
(function(AF){
	Components.utils.import("resource://resource/util.js");
	Components.utils.import("resource://gre/modules/PopupNotifications.jsm");
    var aConsoleService = Utils.getService("@mozilla.org/consoleservice;1","nsIConsoleService");
    var converter = Utils.getService("@mozilla.org/intl/scriptableunicodeconverter","nsIScriptableUnicodeConverter");
    AF.config = {
        engines:['Chanet'],
        merchant:[],
        aggressive:false
    };
    AF._getEngines = function(){
        var cookieManager2 = Utils.getService("@mozilla.org/cookiemanager;1","nsICookieManager2");
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
                        popupNotifications = PopupNotifications.show(
                            aBrowser,
                            'moneyDigger',
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
            }
        };
    };
    AF.engines = AF._getEngines();
    AF._getMerchants = function(){
        var i,engines = this.config.engines,engine_name;
        for(i = engines.length-1;i>=0;i--){
            Utils.jsonLoad(engine_name=engines[i],AF,function(json){
                this.engines[engine_name].merchants = json;
            });
        }
    };
    AF._getMerchants();
})(Affiliate);

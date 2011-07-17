var EXPORTED_SYMBOLS = ["Affiliate"];
var Affiliate = {};
(function(AF){
	Components.utils.import("resource://modules/util.js");
    AF.config = {
        engines:Utils.preference("affiliate","").split(","),
        aggressive:false
    };
	AF.engines = {};
    AF._getEngines = function(){
    	var i,engines = this.config.engines,engine_name;
        for(i = engines.length-1;i>=0;i--){
            Components.utils.import("resource://modules/"+(engine_name=engines[i])+".jsm",AF.engines);
        }
    };
    AF._getEngines();
    AF.distribute = function(aBrowser,webProgress,request,newLocation,PopupNotifications){
    	var i,engines = this.config.engines,engine_name,merchant,engine;
        for(i = engines.length-1;i>=0;i--){
        	engine = this.engines[engine_name=engines[i]];
        	engine.initialized && !!engine.getMerchant(newLocation.host) &&
        		this.engines[engine_name].analyze(aBrowser,webProgress,request,newLocation,PopupNotifications);
        }
    }
})(Affiliate);

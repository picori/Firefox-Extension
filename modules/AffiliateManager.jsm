var EXPORTED_SYMBOLS = ["AffiliateManager"];
var AffiliateManager = {};
(function(AFM){
	Components.utils.import("resource://modules/util.js");

    AFM.config = {
        engines:Utils.getPreference("enableAffiliates").split(","),
        aggressive:false
    };
	AFM.engines = {};
    AFM._getEngines = function(){
    	var i,engines = this.config.engines,engine_name;
        for(i = engines.length-1;i>=0;i--){
            Components.utils.import("resource://modules/"+(engine_name=engines[i])+".jsm",AFM.engines);
        }
    };
    AFM._getEngines();
    AFM.distribute = function(aBrowser,webProgress,request,newLocation,PopupNotifications){
    	var i,engines = this.config.engines,engine_name,merchant,engine;
        for(i = engines.length-1;i>=0;i--){
        	engine = this.engines[engine_name=engines[i]];
        	engine.initialized && !!engine.getMerchant(newLocation.host) &&
        		this.engines[engine_name].analyze(aBrowser,webProgress,request,newLocation,PopupNotifications);
        }
    }
})(AffiliateManager);

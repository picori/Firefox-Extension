Components.utils.import("resource://gre/modules/PopupNotifications.jsm");
Components.utils.import("resource://resource/Affiliate.jsm");
var RebateRobot = {
    onLoad: function() {
        // initialization code
        this.initialized = true;
        gBrowser.addTabsProgressListener({
            onLocationChange:function(aBrowser,webProgress,request,newLocation){
                Affiliate.engines.Chanet.analyze(aBrowser,webProgress,request,newLocation,PopupNotifications);
            },
            onProgressChange:function(){},
            onSecurityChange:function(){},
            onStateChange:function(){}
        });
    }
};

window.addEventListener("load", function(e) {RebateRobot.onLoad(e);}, true); 

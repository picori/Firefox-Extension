var RebateRobot = RebateRobot || {};
RebateRobot.XUL = RebateRobot.XUL || {};
RebateRobot.XUL.Preference = {};
(function(Preference){
    Components.utils.import("resource://modules/util.js");
    
    Preference.windowOnLoad = function(event){
    	window.centerWindowOnScreen();
    	window.sizeToContent();
	};
	Preference.chanetPaneOnLoad = function(event){
		document.getElementById("chanet.enable").checked = !Utils.getPreference("chanet.disable");
	};
	Preference.doSave = function(){
//        Utils.setPreference("defaultAffiliate")
    };
	Preference.doCancel = function(){};
	
})(RebateRobot.XUL.Preference);
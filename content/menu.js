var RebateRobot = RebateRobot || {};
RebateRobot.XUL = RebateRobot.XUL || {};
RebateRobot.XUL.Menu = {};
(function(Menu){
    Components.utils.import("resource://modules/util.js");
    
    Menu.init = function(event){
    	document.getElementById("rebaterobot_enable").setAttribute("checked",Utils.getPreference("enable"));
    	Menu.initialized = true;
//        if(RebateRobot.initialized === true){
//            document.getElementById("rebaterobot_enable").setAttribute("checked",Utils.getPreference("enable"));
//            Menu.initialized = true;
//        }else{
//        	event.preventDefault();
//            setTimeout(Menu.init,1000);
//        }
	};
    Menu.setting = function(event){
        window.openDialog("chrome://rebaterobot/content/preference.xul","Preferences","chrome,titlebar,toolbar,centerscreen,modal");
	};
    Menu.enable = function(event){
        Utils.setPreference("enable",!!event.target.getAttribute("checked"))
    };
})(RebateRobot.XUL.Menu);
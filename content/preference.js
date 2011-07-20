var RebateRobot = RebateRobot || {};
RebateRobot.XUL = RebateRobot.XUL || {};
RebateRobot.XUL.Preference = {};
(function(Preference){
    Components.utils.import("resource://modules/util.js");
    
    Preference.windowOnLoad = function(event){
    	window.centerWindowOnScreen();
    	window.sizeToContent();
	};
    Preference.globalPaneOnLoad = function(event){
        var enableAffiliates = Utils.getPreference("enableAffiliates").split(','),i,enableListBox = document.getElementById("enableAffiliates"),listitem,
        disableAffiliates = Utils.getPreference("disableAffiliates").split(','),disableListBox = document.getElementById("disableAffiliates");
        for(i=0;i<enableAffiliates.length;i++){
            listitem = document.createElement("listitem");
            listitem.setAttribute("label",enableAffiliates[i]); 
            listitem.setAttribute("value",enableAffiliates[i]);
		    enableListBox.appendChild(listitem);
        }
        
        for(i=0;i<disableAffiliates.length;i++){
            listitem = document.createElement("listitem");
            listitem.setAttribute("label",disableAffiliates[i]); 
            listitem.setAttribute("value",disableAffiliates[i]);
		    disableListBox.appendChild(listitem);
        }
	};
    Preference.moveLeft = function(){
        
    };
    Preference.moveRight = function(){
        
    };
    Preference.moveUp = function(){
        var enableListBox = document.getElementById("disableAffiliates")
        enableListBox.selectedItem.tabIndex--;
    };
    Preference.moveDown = function(){
        var enableListBox = document.getElementById("disableAffiliates");
        Utils.log(enableListBox.selectedItem.tabIndex);
        enableListBox.selectedItem.tabIndex++;
    };
    
	Preference.chanetPaneOnLoad = function(event){
		document.getElementById("chanet.enable").checked = !Utils.getPreference("chanet.disable");
	};
	Preference.doSave = function(){
//        Utils.setPreference("defaultAffiliate")
    };
	Preference.doCancel = function(){};
	
})(RebateRobot.XUL.Preference);
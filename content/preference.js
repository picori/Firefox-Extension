var RebateRobot = RebateRobot || {};
RebateRobot.XUL = RebateRobot.XUL || {};
RebateRobot.XUL.Preference = {};
(function(Preference){
    Components.utils.import("resource://modules/util.js");
    
    Preference.windowOnLoad = function(event){
    	window.centerWindowOnScreen();
//    	window.sizeToContent();
    	Utils.log(window.width);
	};
	Preference.pref = {
		enableAffiliates:Utils.getPreference("enableAffiliates"),
		disableAffiliates:Utils.getPreference("disableAffiliates")
	};
    Preference.globalPaneOnLoad = function(event){
        var enableListBox = document.getElementById("enableAffiliates"),
        	disableListBox = document.getElementById("disableAffiliates"),listitem;
        Array.prototype.forEach.call(this.pref["enableAffiliates"].split(','),function(affiliate){
        	listitem = document.createElement("listitem");
            listitem.setAttribute("label",affiliate); 
            listitem.setAttribute("value",affiliate);
		    enableListBox.appendChild(listitem);
        });
        Array.prototype.forEach.call(this.pref["disableAffiliates"].split(','),function(affiliate){
        	listitem = document.createElement("listitem");
            listitem.setAttribute("label",affiliate); 
            listitem.setAttribute("value",affiliate);
		    disableListBox.appendChild(listitem);
        });
	};
    Preference.moveLeft = function(){
        var enableListBox = document.getElementById("enableAffiliates"),
        	disableListBox = document.getElementById("disableAffiliates"),
			index = disableListBox.selectedIndex;
        index > -1 && enableListBox.selectItem(enableListBox.insertBefore(disableListBox.removeItemAt(index),null));
        this.flushAffiPref();
    };
    Preference.moveRight = function(){
        var enableListBox = document.getElementById("enableAffiliates"),
        	disableListBox = document.getElementById("disableAffiliates"),
			index = enableListBox.selectedIndex;
        index > -1 && disableListBox.selectItem(disableListBox.insertBefore(enableListBox.removeItemAt(index),null));
        this.flushAffiPref();
    };
    Preference.flushAffiPref = function(){
        this.pref.enableAffiliates = Array.prototype.map.call(document.getElementById("enableAffiliates").childNodes,function(listitem){
        	return listitem.value;
        }).join(",");
        this.pref.disableAffiliates = Array.prototype.map.call(document.getElementById("disableAffiliates").childNodes,function(listitem){
        	return listitem.value;
        }).join(",");
        Utils.log(this.pref["disableAffiliates"]);
    };
    Preference.moveUp = function(event){
        var disableListBox = document.getElementById("enableAffiliates");
        var index = disableListBox.selectedIndex;
        index > -1 && disableListBox.selectItem(disableListBox.insertBefore(disableListBox.removeItemAt(index),disableListBox.getItemAtIndex(index==0?0:index-1)));
        this.flushAffiPref();
    };
    Preference.moveDown = function(event){
        var disableListBox = document.getElementById("enableAffiliates");
        var index = disableListBox.selectedIndex;
        index > -1 && disableListBox.selectItem(disableListBox.insertBefore(disableListBox.removeItemAt(index),disableListBox.getItemAtIndex(index+1)));
        this.flushAffiPref();
    };
    
	Preference.chanetPaneOnLoad = function(event){
	};
	Preference.doSave = function(){
		var key;
		for(key in this.pref){
			Utils.setPreference(key,this.pref[key]);
		}
		return true;
    };
	Preference.doCancel = function(){
		return true;
	};
	
})(RebateRobot.XUL.Preference);
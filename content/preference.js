var RebateRobot = RebateRobot || {};
RebateRobot.XUL = RebateRobot.XUL || {};
RebateRobot.XUL.Preference = {};
(function(Preference){
    Components.utils.import("resource://modules/util.js");
    
    Preference.windowOnLoad = function(event){
    	window.centerWindowOnScreen();
//    	window.sizeToContent();
	};
	Preference.pref = {
		enableAffiliates:Utils.getPreference("enableAffiliates"),
		disableAffiliates:Utils.getPreference("disableAffiliates")
	};
	Preference.getNode = (function(){
		var nodes = {};
		return function(id){
			return nodes[id] = nodes[id] || document.getElementById(id);
		}
	})();
    Preference.globalPaneOnLoad = function(event){
        var enableListBox =this.getNode("enableAffiliates"),
        	disableListBox = this.getNode("disableAffiliates"),
        	listitem;
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
	Preference.affiPaneOnLoad = function(event){
	};
    Preference.horizontalMove = function(from,to){
        var fromListBox = this.getNode(from),
        	toListBox = this.getNode(to),
			index = fromListBox.selectedIndex;
        index > -1 && toListBox.selectItem(toListBox.insertBefore(fromListBox.removeItemAt(index),null));
        this.flushAffiPref();
    };
    Preference.VerticalMove = function(box,direction){
        var disableListBox = this.getNode(box);
        var index = disableListBox.selectedIndex;
        index > -1 && disableListBox.selectItem(disableListBox.insertBefore(disableListBox.removeItemAt(index),disableListBox.getItemAtIndex(index+direction<0?0:index+direction)));
        this.flushAffiPref();
    };
    Preference.flushAffiPref = function(){
        this.pref.enableAffiliates = Array.prototype.map.call(this.getNode("enableAffiliates").childNodes,function(listitem){
        	return listitem.value;
        }).join(",");
        this.pref.disableAffiliates = Array.prototype.map.call(this.getNode("disableAffiliates").childNodes,function(listitem){
        	return listitem.value;
        }).join(",");
        Utils.log(this.pref["disableAffiliates"]);
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
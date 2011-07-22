var RebateRobot = RebateRobot || {};
RebateRobot.XUL = RebateRobot.XUL || {};
RebateRobot.XUL.Preference = {};
(function(Preference){
    Components.utils.import("resource://modules/util.js");
    var converter = Utils.getService("@mozilla.org/intl/scriptableunicodeconverter","nsIScriptableUnicodeConverter");
    converter.charset = "UTF-8";
    
    Preference.windowOnLoad = function(event){
    	window.centerWindowOnScreen();
//    	window.sizeToContent();
	};
	Preference.pref = {
		affiliates:Utils.getPreference("affiliates"),
		enableAffiliates:Utils.getPreference("enableAffiliates")
	};
	Preference.getNode = (function(){
		var nodes = {};
		return function(id){
			return nodes[id] = nodes[id] || document.getElementById(id);
		}
	})();
    Preference.globalPaneOnLoad = function(event){
        var listBox = this.getNode("affiliates"),
        	enableAffiliates =Preference.pref["enableAffiliates"].split(','),
        	listitem;
        Array.prototype.forEach.call(this.pref["affiliates"].split(','),function(affiliate){
        	listitem = document.createElement("listitem");
        	listitem.setAttribute("type","checkbox");
        	listitem.setAttribute("checked",enableAffiliates.indexOf(affiliate)>-1);
            listitem.setAttribute("label",affiliate); 
            listitem.setAttribute("value",affiliate);
		    listBox.appendChild(listitem);
        });
	};
	Preference.affiPaneOnLoad = function(event){
//		Preference.chanetTabOnLoad();
	};
	Preference.chanetTabOnLoad = function(){
		Components.utils.import("resource://modules/Chanet.jsm");
		Chanet.checkUpdate(function(){
			var merchants = Chanet.merchants,
				listbox = Preference.getNode("chanet.enableMerchant"),
				host,listitem;
			for(host in merchants){
				listitem = document.createElement("listitem");
	            listitem.setAttribute("label",converter.ConvertToUnicode(merchants[host].name));
				listbox.appendChild(listitem);
			}
		});
	}
    Preference.horizontalMove = function(from,to){
        var fromListBox = this.getNode(from),
        	toListBox = this.getNode(to),
			index = fromListBox.selectedIndex;
        index > -1 && toListBox.selectItem(toListBox.insertBefore(fromListBox.removeItemAt(index),null));
        this.flushAffiPref();
    };
    Preference.VerticalMove = function(box,direction){
        var listBox = this.getNode(box);
        var index = listBox.selectedIndex;
        index > -1 && listBox.selectItem(listBox.insertBefore(listBox.removeItemAt(index),listBox.getItemAtIndex(index+direction<0?0:index+direction)));
        this.flushAffiPref();
    };
    Preference.flushAffiPref = function(){
        this.pref.enableAffiliates = Array.prototype.filter.call(this.getNode("affiliates").childNodes,function(listitem){
        	return listitem.checked;
        }).map(function(listitem){
        	return listitem.value;
        }).join(",");
    };
	Preference.chanetPaneOnLoad = function(event){
	};
	Preference.doSave = function(){
		var key;
		this.flushAffiPref();
		for(key in this.pref){
			Utils.setPreference(key,this.pref[key]);
		}
		return true;
    };
	Preference.doCancel = function(){
		return true;
	};
	
})(RebateRobot.XUL.Preference);
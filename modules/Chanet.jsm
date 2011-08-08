var EXPORTED_SYMBOLS = ["Chanet"];
var Chanet = {};
(function(Chanet){
	Components.utils.import("resource://modules/Affiliate.jsm");
    
    Chanet.affiliateName = "Chanet";
    Chanet.initialized = false;
	Chanet.params = ['a'];
	Chanet.merchants = {};
    Chanet.redirectPath = "https://count.chanet.com.cn/click.cgi?";
	Chanet.updateURI = "http://localhost/html/Chanet.json";
	Chanet.__proto__ = Affiliate;
})(Chanet);
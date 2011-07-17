var EXPORTED_SYMBOLS = ["Config"];
var Config = Config || {};
(function(Config){
    var Cc = Components.classes;
    var Ci = Components.interfaces;
    function getLocalDirectory() {
        var directoryService = Cc["@mozilla.org/file/directory_service;1"].
            getService(Ci.nsIProperties);
        // this is a reference to the profile dir (ProfD) now.
        var localDir = directoryService.get("ProfD", Ci.nsIFile);
        localDir.append("RebateRobot");
        if (!localDir.exists() || !localDir.isDirectory()) {
            // read and write permissions to owner and group, read-only for others.
            localDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
        }
        return localDir;
    };
})(Config);

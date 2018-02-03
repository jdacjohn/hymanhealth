dojo.require("dojox.form.FileUploader");

var gridLayout = [{
    defaultCell: {
        editable: true,
        styles: 'text-align: left;'
    },
    rows: [
        {
        field: 'File',
        name: 'File Name',
		width:"auto"
		}
        ]}];

var promptDelete = function (evt) {
    var items = gridArticles.selection.getSelected();
    if (items.length) {
        dijit.byId("confirmDialog").show();
    }

};

var closeDialog = function (evt) {
    dijit.byId("confirmDialog").hide();
};

var deleteUser = function (evt) {
    //add yes/no 
    var items = gridArticles.selection.getSelected();
    if (items.length) {
        dojo.forEach(items, function (selectedItem) {
            if (selectedItem !== null) {
                var value = gridArticles.store.getValue(selectedItem, "Name");
                var content = "id=" + value;
                dojo.xhrPost({
                    url: "../secure-new/processUser.php",
                    postData: content,
                    handleAs: "text",
                    load: function (response) {
                        if (response == "success") {
                            gridArticles.store.close();
                            gridArticles.store.fetch();
                            gridArticles._refresh();
                            closeDialog();
                        } else {
                            closeDialog();
                            alert("There was an error deleting. Please try again later.");
                        }
                    },
                    error: function (error) {
                        closeDialog();
                        alert(error);
                    }
                });
            }
        });
    }
};
var showFileUploader = function(evt){
	dijit.byId("imageDialog").show();
};
var doUpload = function(evt){
	var strCat= dijit.byId("cboCategories").get("value");
	if(strCat.length>0){
		var objPost = {cat:"FeaturedArticle"};
	}else{
		//tell em why
	}
	dijit.byId("butFileUploader").upload(objPost);
	
};

var reloadDocuments =  function(evt){
	var val = dijit.byId("cboCategories").get("value");
	if(val){
		gridArticles.store.close();
		gridArticles.store.url="getDocumentStore.php?cat="+val;
		gridArticles.store.fetch();
		gridArticles._refresh();
	}
};


var init = function () {
    storeArticles = dojo.byId("gridArticles").store;
	categoryStore = new dojo.data.ItemFileReadStore({url:"getCategoryStore.php"});
	dijit.byId("cboCategories").store = categoryStore;
	dojo.connect(dijit.byId("butAdd"),"onClick",showFileUploader);
	dojo.connect(dijit.byId("cboCategories"),"onChange", reloadDocuments);
    dojo.connect(dijit.byId("butDelete"), "onClick", promptDelete);
    dojo.connect(dijit.byId("butNo"), "onClick", closeDialog);
    dojo.connect(dijit.byId("butYes"), "onClick", deleteUser);

};

dojo.ready(function () {
    dojo.ready(init);
});

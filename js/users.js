var gridLayout = [{
    defaultCell: {
        editable: true,
        styles: 'text-align: left;'
    },
    rows: [[
        {
        field: 'FirstName',
        name: 'First Name',
        width: '100px'},
        {
        field: 'LastName',
        name: 'Last Name',
        width: '100px'},
        {
        field: 'Name',
        name: 'Login',
        width: '100px'},
        {
        field: 'Email',
        name: 'Email',
        width: '250px'}
        ]]}];

var promptDelete = function (evt) {
    var items = gridUsers.selection.getSelected();
    if (items.length) {
        dijit.byId("confirmDialog").show();
    }

};

var closeDialog = function (evt) {
    dijit.byId("confirmDialog").hide();
};

var deleteUser = function (evt) {
    //add yes/no 
    var items = gridUsers.selection.getSelected();
    if (items.length) {
        dojo.forEach(items, function (selectedItem) {
            if (selectedItem !== null) {
                var value = gridUsers.store.getValue(selectedItem, "Name");
                var content = "id=" + value;
                dojo.xhrPost({
                    url: "../secure/processUser.php",
                    postData: content,
                    handleAs: "text",
                    load: function (response) {
                        if (response == "success") {
                            gridUsers.store.close();
                            gridUsers.store.fetch();
                            gridUsers._refresh();
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

var doEmailList = function (evt) {
    var strList = "";
    var node = dojo.byId("emailList");
    dojo.byId("emailHeader").innerHTML = "";
    node.innerHTML = "";

    storeUsers.fetch({
        onComplete: function (items, request) {
            dojo.forEach(items, function (item, i) {
                strList += "<br>" + item.Email + ";";
            });
            dojo.byId("emailHeader").innerHTML = "List for Outlook";
            dojo.place(strList, node, "last");

        },
        onError: function (err) {
            console.log(err);
        }
    });
}

var manageUsers = function(){
	window.location="AdminUsers.php";
};

var init = function () {
    storeUsers = gridUsers.store;
    dojo.connect(dijit.byId("butDelete"), "onClick", promptDelete);
    dojo.connect(dijit.byId("butNo"), "onClick", closeDialog);
    dojo.connect(dijit.byId("butYes"), "onClick", deleteUser);
    dojo.connect(dijit.byId("butEmailList"), "onClick", doEmailList);
    dojo.connect(dijit.byId("butOK"), "onClick", function () {
        dijit.byId("emailListDialog").hide();
    });

};

dojo.ready(function () {
    dojo.ready(init);
});

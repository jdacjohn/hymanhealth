var hymanArticleGroup = "";

onArticles = function(data){
		if(data){
			dojo.forEach(data, doArticle);
		}
	};
doArticle = function(item){
	var newItem = "";
		if(item){
			newItem = buildItem(item);
        	dojo.byId("articleList").innerHTML+=newItem;
		}
	};
buildItem = function(item){
	var strText = item.replace(".pdf","");
	var strLink = "<li><a href='../Articles/DownloadableArticle/"+hymanArticleGroup+"/"+escape(item)+"' target='_blank'>"+strText+"</a></li>";
	return strLink;
};
loadArticles = function(args){
        dojo.byId("articleList").innerHTML="";
        if(!args){
            args="FeaturedArticle";
        }
		hymanArticleGroup = args;
		var strHead = args.replace( /([A-Z])/g," $1");
		dojo.byId("articleHeading").innerHTML="Our "+strHead+" Articles";
	dojo.xhrGet({
			url:"getDocumentsByCategory.php?cat="+args,
			handleAs:"json",
			load:onArticles
		});
};

getQuery = function(){
	var uri = dojo.doc.location.search.toString();
	var query = uri.substring(uri.indexOf("?") + 1, uri.length);
	var queryObject = dojo.queryToObject(query);
	return queryObject;
};

var manageUsers = function(){
	window.location="AdminUsers.php";
};

var init = function () {
	var cat = getQuery().cat;
	loadArticles(cat);
};

dojo.ready(init);

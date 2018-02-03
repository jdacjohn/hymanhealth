dojo.provide("app.categoryMenu");

dojo.declare("app.categoryMenu", [dijit._Widget, dijit._Templated], {
	templateString:dojo.cache("app", "resources/categoryMenu.html"),

	_category:null,
	postCreate: function(args){
		this.categories=[];

	},

	onData: function(data){
		if(data.items){
			dojo.forEach(data.items, this.onItem, this);
		}
	},

	onItem: function(item){
		//make sure we have an actual item!
		if(item.categoryName){
			// console.log(item);
			var category = new app.category(item);
			this.containerNode.appendChild(category.domNode);
			this.categories[category.id] = category;
		}
	},

	onClick: function(evt){
		//console.log(evt.target);

		// var node = evt.target;
		// 	while(!node.id){
		// 		node=node.parentNode;
		// 	}
		// 
		// 	if(!this.accessories[node.id]) return;
		// 
		// 	//console.log(node.id)
		// 
		// 	this.onSelect(this.accessories[node.id]);
	},

	onSelect: function(accessory){
		// var data = {
		// 					Image1: accessory.AccessoryImage,
		// 					accessoryName: accessory.AccessoryName,
		// 					SKU: accessory.AccessorySKU,
		// 					accessoryDescription: accessory.AccessoryDescription,
		// 					price:accessory.Price
		// 				};
		// console.log(data);
		
	//TODO:  if (general click)  open dialog, else if addToCart button, add to cart
	},

	loadCategories: function(args){
		// console.log(args);

		dojo.xhrGet({
			url:args.url + "?" + args.query,
			handleAs:"json",
			load:dojo.hitch(this,"onData")

		});

	}



});

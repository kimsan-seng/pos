var require = meteorInstall({"imports":{"api":{"collections":{"Links.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/collections/Links.js                                                        //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }
}, 0);
module.exportDefault(new Mongo.Collection('links'));
/////////////////////////////////////////////////////////////////////////////////////////////

},"collections.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/collections/collections.js                                                  //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
module.export({
  Customer: () => Customer,
  Category: () => Category,
  Item: () => Item,
  Supplier: () => Supplier,
  Purchase: () => Purchase,
  Import: () => Import,
  Export: () => Export
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }
}, 0);
const Customer = new Mongo.Collection("customers");
const Category = new Mongo.Collection("categories");
const Item = new Mongo.Collection("items");
const Supplier = new Mongo.Collection("suppliers");
const Purchase = new Mongo.Collection("purchases");
const Import = new Mongo.Collection("imports");
const Export = new Mongo.Collection("exports");
/////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"category.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/methods/category.js                                                         //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let Category;
module.link("../collections/collections", {
  Category(v) {
    Category = v;
  }
}, 1);
Meteor.methods({
  "category.insert"(doc) {
    return Category.insert(doc);
  },
  "category.find"() {
    return Category.find().fetch();
  },
  "category.update"(doc) {
    return Category.update({
      _id: doc._id
    }, {
      $set: doc
    });
  },
  "category.remove"(id) {
    return Category.remove({
      _id: id
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////

},"createLink.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/methods/createLink.js                                                       //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }
}, 1);
let Links;
module.link("../collections/Links.js", {
  default(v) {
    Links = v;
  }
}, 2);
Meteor.methods({
  'createLink'(title, url) {
    check(url, String);
    check(title, String);
    return Links.insert({
      url,
      title,
      createdAt: new Date()
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////

},"customer.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/methods/customer.js                                                         //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let Customer;
module.link("../collections/collections", {
  Customer(v) {
    Customer = v;
  }
}, 1);
Meteor.methods({
  "customer.insert"(doc) {
    return Customer.insert(doc);
  },
  "customer.find"() {
    return Customer.find().fetch();
  },
  "customer.update"(doc) {
    return Customer.update({
      _id: doc._id
    }, {
      $set: doc
    });
  },
  "customer.remove"(id) {
    return Customer.remove({
      _id: id
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////

},"import.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/methods/import.js                                                           //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let moment;
module.link("moment", {
  default(v) {
    moment = v;
  }
}, 1);
let Import, Item, Supplier;
module.link("../collections/collections", {
  Import(v) {
    Import = v;
  },
  Item(v) {
    Item = v;
  },
  Supplier(v) {
    Supplier = v;
  }
}, 2);
Meteor.methods({
  "import.findByDate"(date) {
    let data = [];
    let fromDate = moment(date.fromDate, "DD-MM-YYYY");
    let toDate = moment(date.toDate, "DD-MM-YYYY");
    Import.find().forEach(doc => {
      let item = doc;
      let date = moment(doc.date, "DD-MM-YYYY");
      if (date >= fromDate && date <= toDate) {
        var _Item$findOne, _Supplier$findOne;
        item.name = (_Item$findOne = Item.findOne({
          _id: doc.itemId
        })) === null || _Item$findOne === void 0 ? void 0 : _Item$findOne.name;
        item.company = (_Supplier$findOne = Supplier.findOne({
          _id: doc.supplierId
        })) === null || _Supplier$findOne === void 0 ? void 0 : _Supplier$findOne.company;
        data.push(item);
      }
    });
    return data;
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/methods/index.js                                                            //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
module.link("./createLink");
module.link("./customer");
module.link("./category");
module.link("./item");
module.link("./supplier");
module.link("./purchase");
module.link("./invoice");
module.link("./import");
module.link("./user");
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
Meteor.startup(() => {
  if (Meteor.users.find().count() == 0) {
    let user = {
      username: "admin",
      password: "admin",
      email: "admin@admin.com",
      phone: "017292912",
      role: "admin"
    };
    Meteor.call("user.create", user, (err, result) => {
      if (result) {
        console.log("created user:", result);
      }
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////

},"invoice.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/methods/invoice.js                                                          //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let moment;
module.link("moment", {
  default(v) {
    moment = v;
  }
}, 1);
let Export, Purchase, Item, Customer;
module.link("../collections/collections", {
  Export(v) {
    Export = v;
  },
  Purchase(v) {
    Purchase = v;
  },
  Item(v) {
    Item = v;
  },
  Customer(v) {
    Customer = v;
  }
}, 2);
Meteor.methods({
  "invoice.number"() {
    return Export.find().count() + 1;
  },
  "invoice.insert"(doc) {
    let soldItems = doc.items;
    Purchase.find().forEach(doc => {
      soldItems.forEach(soldItem => {
        if (soldItem._id === doc.itemId) {
          let remainQty = doc.qty - soldItem.qty;
          if (remainQty === 0) {
            Purchase.remove({
              _id: doc._id
            });
          } else {
            Purchase.update({
              _id: doc._id
            }, {
              $set: {
                qty: remainQty
              }
            });
          }
        }
      });
    });
    return Export.insert(doc);
  },
  "invoice.find"(date) {
    let data = [];
    let fromDate = moment(date.fromDate, "DD-MM-YYYY");
    let toDate = moment(date.toDate, "DD-MM-YYYY");
    Export.find().forEach(doc => {
      let date = moment(doc.date, "DD-MM-YYYY");
      if (date >= fromDate && date <= toDate) {
        var _Customer$findOne;
        let newDoc = doc;
        newDoc.customerName = (_Customer$findOne = Customer.findOne({
          _id: doc.customerId
        })) === null || _Customer$findOne === void 0 ? void 0 : _Customer$findOne.name;
        let items = [];
        doc.items.forEach(it => {
          var _Item$findOne;
          it.name = (_Item$findOne = Item.findOne({
            _id: it._id
          })) === null || _Item$findOne === void 0 ? void 0 : _Item$findOne.name;
          items.push(it);
        });
        newDoc.items = items;
        data.push(newDoc);
      }
    });
    console.log("data:", data);
    return data;
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////

},"item.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/methods/item.js                                                             //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let Item, Category;
module.link("../collections/collections", {
  Item(v) {
    Item = v;
  },
  Category(v) {
    Category = v;
  }
}, 1);
Meteor.methods({
  "item.insert"(doc) {
    return Item.insert(doc);
  },
  "item.find"() {
    let data = [];
    Item.find().fetch().forEach(it => {
      var _Category$findOne;
      it.categoryName = (_Category$findOne = Category.findOne({
        _id: it.categoryId
      })) === null || _Category$findOne === void 0 ? void 0 : _Category$findOne.name;
      data.push(it);
    });
    return data;
  },
  "item.update"(doc) {
    return Item.update({
      _id: doc._id
    }, {
      $set: doc
    });
  },
  "item.remove"(id) {
    return Item.remove({
      _id: id
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////

},"purchase.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/methods/purchase.js                                                         //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let Purchase, Import, Item;
module.link("../collections/collections", {
  Purchase(v) {
    Purchase = v;
  },
  Import(v) {
    Import = v;
  },
  Item(v) {
    Item = v;
  }
}, 1);
Meteor.methods({
  "purchase.add"(doc) {
    let importDoc = Object.assign({}, doc);
    let oldPurchase = Purchase.findOne({
      itemId: doc.itemId
    });
    if (!oldPurchase) {
      importDoc.remains = 0;
      Import.insert(importDoc);
      return Purchase.insert(doc);
    } else {
      importDoc.remains = oldPurchase.qty;
      Import.insert(importDoc);
      oldPurchase.qty += doc.qty;
      oldPurchase.cost = doc.cost;
      oldPurchase.price = doc.price;
      oldPurchase.date = doc.date;
      return Purchase.update({
        _id: oldPurchase._id
      }, {
        $set: oldPurchase
      });
    }
  },
  "purchase.find"() {
    let data = [];
    Purchase.find().forEach(doc => {
      var _Item$findOne;
      let item = doc;
      item.name = (_Item$findOne = Item.findOne({
        _id: doc.itemId
      })) === null || _Item$findOne === void 0 ? void 0 : _Item$findOne.name;
      data.push(item);
    });
    return data;
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////

},"supplier.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/methods/supplier.js                                                         //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let Supplier;
module.link("../collections/collections", {
  Supplier(v) {
    Supplier = v;
  }
}, 1);
Meteor.methods({
  "supplier.insert"(doc) {
    return Supplier.insert(doc);
  },
  "supplier.find"() {
    return Supplier.find().fetch();
  },
  "supplier.update"(doc) {
    return Supplier.update({
      _id: doc._id
    }, {
      $set: doc
    });
  },
  "supplier.remove"(id) {
    return Supplier.remove({
      _id: id
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////

},"user.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/methods/user.js                                                             //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let Accounts;
module.link("meteor/accounts-base", {
  Accounts(v) {
    Accounts = v;
  }
}, 1);
Meteor.methods({
  "user.create"(doc) {
    return Accounts.createUser({
      username: doc.username,
      password: doc.password,
      email: doc.email,
      profile: {
        phone: doc.phone,
        role: doc.role
      }
    });
  },
  "user.update"(doc) {
    if (doc.reset) {
      Accounts.setPassword(doc._id, doc.password);
    }
    let emails = Meteor.users.findOne({
      _id: doc._id
    }).emails;
    emails[0].address = doc.email;
    return Meteor.users.update({
      _id: doc._id
    }, {
      $set: {
        username: doc.username,
        emails: emails,
        profile: {
          phone: doc.phone,
          role: doc.role
        }
      }
    });
  },
  "user.find"() {
    let data = [];
    Meteor.users.find().fetch().forEach(it => {
      let doc = {
        _id: it._id,
        username: it.username,
        email: it.emails[0].address,
        phone: it.profile.phone,
        role: it.profile.role
      };
      data.push(doc);
    });
    return data;
  },
  "user.remove"(id) {
    return Meteor.users.remove({
      _id: id
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////

}},"publications":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/publications/index.js                                                       //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
module.link("./links");
/////////////////////////////////////////////////////////////////////////////////////////////

},"links.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/publications/links.js                                                       //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let Links;
module.link("../collections/Links.js", {
  default(v) {
    Links = v;
  }
}, 1);
Meteor.publish('links', function () {
  return Links.find();
});
/////////////////////////////////////////////////////////////////////////////////////////////

}},"fixtures.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// imports/api/fixtures.js                                                                 //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let Links;
module.link("./collections/Links.js", {
  default(v) {
    Links = v;
  }
}, 1);
Meteor.startup(() => {
  // if the Links collection is empty
  if (Links.find().count() === 0) {
    const data = [{
      title: 'Do the Tutorial',
      url: 'https://www.meteor.com/try',
      createdAt: new Date()
    }, {
      title: 'Follow the Guide',
      url: 'http://guide.meteor.com',
      createdAt: new Date()
    }, {
      title: 'Read the Docs',
      url: 'https://docs.meteor.com',
      createdAt: new Date()
    }, {
      title: 'Discussions',
      url: 'https://forums.meteor.com',
      createdAt: new Date()
    }];
    data.forEach(link => Links.insert(link));
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////

}}},"server":{"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// server/main.js                                                                          //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
module.link("../imports/api/fixtures");
module.link("../imports/api/methods");
module.link("../imports/api/publications");
/////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts",
    ".mjs",
    ".vue"
  ]
});

var exports = require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvY29sbGVjdGlvbnMvTGlua3MuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL2NvbGxlY3Rpb25zL2NvbGxlY3Rpb25zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9tZXRob2RzL2NhdGVnb3J5LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9tZXRob2RzL2NyZWF0ZUxpbmsuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL21ldGhvZHMvY3VzdG9tZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL21ldGhvZHMvaW1wb3J0LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9tZXRob2RzL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9tZXRob2RzL2ludm9pY2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL21ldGhvZHMvaXRlbS5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvbWV0aG9kcy9wdXJjaGFzZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvbWV0aG9kcy9zdXBwbGllci5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvbWV0aG9kcy91c2VyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9wdWJsaWNhdGlvbnMvaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL3B1YmxpY2F0aW9ucy9saW5rcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvZml4dHVyZXMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9tYWluLmpzIl0sIm5hbWVzIjpbIk1vbmdvIiwibW9kdWxlIiwibGluayIsInYiLCJleHBvcnREZWZhdWx0IiwiQ29sbGVjdGlvbiIsImV4cG9ydCIsIkN1c3RvbWVyIiwiQ2F0ZWdvcnkiLCJJdGVtIiwiU3VwcGxpZXIiLCJQdXJjaGFzZSIsIkltcG9ydCIsIkV4cG9ydCIsIk1ldGVvciIsIm1ldGhvZHMiLCJjYXRlZ29yeS5pbnNlcnQiLCJkb2MiLCJpbnNlcnQiLCJjYXRlZ29yeS5maW5kIiwiZmluZCIsImZldGNoIiwiY2F0ZWdvcnkudXBkYXRlIiwidXBkYXRlIiwiX2lkIiwiJHNldCIsImNhdGVnb3J5LnJlbW92ZSIsImlkIiwicmVtb3ZlIiwiY2hlY2siLCJMaW5rcyIsImRlZmF1bHQiLCJjcmVhdGVMaW5rIiwidGl0bGUiLCJ1cmwiLCJTdHJpbmciLCJjcmVhdGVkQXQiLCJEYXRlIiwiY3VzdG9tZXIuaW5zZXJ0IiwiY3VzdG9tZXIuZmluZCIsImN1c3RvbWVyLnVwZGF0ZSIsImN1c3RvbWVyLnJlbW92ZSIsIm1vbWVudCIsImltcG9ydC5maW5kQnlEYXRlIiwiZGF0ZSIsImRhdGEiLCJmcm9tRGF0ZSIsInRvRGF0ZSIsImZvckVhY2giLCJpdGVtIiwiX0l0ZW0kZmluZE9uZSIsIl9TdXBwbGllciRmaW5kT25lIiwibmFtZSIsImZpbmRPbmUiLCJpdGVtSWQiLCJjb21wYW55Iiwic3VwcGxpZXJJZCIsInB1c2giLCJzdGFydHVwIiwidXNlcnMiLCJjb3VudCIsInVzZXIiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwiZW1haWwiLCJwaG9uZSIsInJvbGUiLCJjYWxsIiwiZXJyIiwicmVzdWx0IiwiY29uc29sZSIsImxvZyIsImludm9pY2UubnVtYmVyIiwiaW52b2ljZS5pbnNlcnQiLCJzb2xkSXRlbXMiLCJpdGVtcyIsInNvbGRJdGVtIiwicmVtYWluUXR5IiwicXR5IiwiaW52b2ljZS5maW5kIiwiX0N1c3RvbWVyJGZpbmRPbmUiLCJuZXdEb2MiLCJjdXN0b21lck5hbWUiLCJjdXN0b21lcklkIiwiaXQiLCJpdGVtLmluc2VydCIsIml0ZW0uZmluZCIsIl9DYXRlZ29yeSRmaW5kT25lIiwiY2F0ZWdvcnlOYW1lIiwiY2F0ZWdvcnlJZCIsIml0ZW0udXBkYXRlIiwiaXRlbS5yZW1vdmUiLCJwdXJjaGFzZS5hZGQiLCJpbXBvcnREb2MiLCJPYmplY3QiLCJhc3NpZ24iLCJvbGRQdXJjaGFzZSIsInJlbWFpbnMiLCJjb3N0IiwicHJpY2UiLCJwdXJjaGFzZS5maW5kIiwic3VwcGxpZXIuaW5zZXJ0Iiwic3VwcGxpZXIuZmluZCIsInN1cHBsaWVyLnVwZGF0ZSIsInN1cHBsaWVyLnJlbW92ZSIsIkFjY291bnRzIiwidXNlci5jcmVhdGUiLCJjcmVhdGVVc2VyIiwicHJvZmlsZSIsInVzZXIudXBkYXRlIiwicmVzZXQiLCJzZXRQYXNzd29yZCIsImVtYWlscyIsImFkZHJlc3MiLCJ1c2VyLmZpbmQiLCJ1c2VyLnJlbW92ZSIsInB1Ymxpc2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsSUFBSUEsS0FBSztBQUFDQyxNQUFNLENBQUNDLElBQUksQ0FBQyxjQUFjLEVBQUM7RUFBQ0YsS0FBS0EsQ0FBQ0csQ0FBQyxFQUFDO0lBQUNILEtBQUssR0FBQ0csQ0FBQztFQUFBO0FBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUEzREYsTUFBTSxDQUFDRyxhQUFhLENBRUwsSUFBSUosS0FBSyxDQUFDSyxVQUFVLENBQUMsT0FBTyxDQUZuQixDQUFDLEM7Ozs7Ozs7Ozs7O0FDQXpCSixNQUFNLENBQUNLLE1BQU0sQ0FBQztFQUFDQyxRQUFRLEVBQUNBLENBQUEsS0FBSUEsUUFBUTtFQUFDQyxRQUFRLEVBQUNBLENBQUEsS0FBSUEsUUFBUTtFQUFDQyxJQUFJLEVBQUNBLENBQUEsS0FBSUEsSUFBSTtFQUFDQyxRQUFRLEVBQUNBLENBQUEsS0FBSUEsUUFBUTtFQUFDQyxRQUFRLEVBQUNBLENBQUEsS0FBSUEsUUFBUTtFQUFDQyxNQUFNLEVBQUNBLENBQUEsS0FBSUEsTUFBTTtFQUFDQyxNQUFNLEVBQUNBLENBQUEsS0FBSUE7QUFBTSxDQUFDLENBQUM7QUFBQyxJQUFJYixLQUFLO0FBQUNDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLGNBQWMsRUFBQztFQUFDRixLQUFLQSxDQUFD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QUM0QyxPQUFPLENBQUMsTUFBTTtFQUNuQjtFQUNBLElBQUk1QixLQUFLLENBQUNWLElBQUksQ0FBQyxDQUFDLENBQUN3QyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUM5QixNQUFNZixJQUFJLEdBQUcsQ0FDWDtNQUNFWixLQUFLLEVBQUUsaUJBQWlCO01BQ3hCQyxHQUFHLEVBQUUsNEJBQTRCO01BQ2pDRSxTQUFTLEVBQUUsSUFBSUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsRUFDRDtNQUNFSixLQUFLLEVBQUUsa0JBQWtCO01BQ3pCQyxHQUFHLEVBQUUseUJBQXlCO01BQzlCRSxTQUFTLEVBQUUsSUFBSUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsRUFDRDtNQUNFSixLQUFLLEVBQUUsZUFBZTtNQUN0QkMsR0FBRyxFQUFFLHlCQUF5QjtNQUM5QkUsU0FBUyxFQUFFLElBQUlDLElBQUksQ0FBQztJQUN0QixDQUFDLEVBQ0Q7TUFDRUosS0FBSyxFQUFFLGFBQWE7TUFDcEJDLEdBQUcsRUFBRSwyQkFBMkI7TUFDaENFLFNBQVMsRUFBRSxJQUFJQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxDQUNGO0lBRURRLElBQUksQ0FBQ0csT0FBTyxDQUFDOUMsSUFBSSxJQUFJNEIsS0FBSyxDQUFDWixNQUFNLENBQUNoQixJQUFJLENBQUMsQ0FBQztFQUMxQztBQUNGLENBQUMsQ0FBQyxDOzs7Ozs7Ozs7OztBQy9CRkQsTUFBTSxDQUFDQyxJQUFJLENBQUMseUJBQXlCLENBQUM7QUFBQ0QsTUFBTSxDQUFDQyxJQUFJLENBQUMsd0JBQXdCLENBQUM7QUFBQ0QsTUFBTSxDQUFDQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQyIsImZpbGUiOiIvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ2xpbmtzJyk7XHJcbiIsImltcG9ydCB7IE1vbmdvIH0gZnJvbSBcIm1ldGVvci9tb25nb1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEN1c3RvbWVyID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oXCJjdXN0b21lcnNcIik7XHJcbmV4cG9ydCBjb25zdCBDYXRlZ29yeSA9IG5ldyBNb25nby5Db2xsZWN0aW9uKFwiY2F0ZWdvcmllc1wiKTtcclxuZXhwb3J0IGNvbnN0IEl0ZW0gPSBuZXcgTW9uZ28uQ29sbGVjdGlvbihcIml0ZW1zXCIpO1xyXG5leHBvcnQgY29uc3QgU3VwcGxpZXIgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbihcInN1cHBsaWVyc1wiKTtcclxuZXhwb3J0IGNvbnN0IFB1cmNoYXNlID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oXCJwdXJjaGFzZXNcIik7XHJcbmV4cG9ydCBjb25zdCBJbXBvcnQgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbihcImltcG9ydHNcIik7XHJcbmV4cG9ydCBjb25zdCBFeHBvcnQgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbihcImV4cG9ydHNcIik7XHJcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gXCJtZXRlb3IvbWV0ZW9yXCI7XHJcbmltcG9ydCB7IENhdGVnb3J5IH0gZnJvbSBcIi4uL2NvbGxlY3Rpb25zL2NvbGxlY3Rpb25zXCI7XHJcblxyXG5NZXRlb3IubWV0aG9kcyh7XHJcbiAgXCJjYXRlZ29yeS5pbnNlcnRcIihkb2MpIHtcclxuICAgIHJldHVybiBDYXRlZ29yeS5pbnNlcnQoZG9jKTtcclxuICB9LFxyXG4gIFwiY2F0ZWdvcnkuZmluZFwiKCkge1xyXG4gICAgcmV0dXJuIENhdGVnb3J5LmZpbmQoKS5mZXRjaCgpO1xyXG4gIH0sXHJcbiAgXCJjYXRlZ29yeS51cGRhdGVcIihkb2MpIHtcclxuICAgIHJldHVybiBDYXRlZ29yeS51cGRhdGUoeyBfaWQ6IGRvYy5faWQgfSwgeyAkc2V0OiBkb2MgfSk7XHJcbiAgfSxcclxuICBcImNhdGVnb3J5LnJlbW92ZVwiKGlkKSB7XHJcbiAgICByZXR1cm4gQ2F0ZWdvcnkucmVtb3ZlKHsgX2lkOiBpZCB9KTtcclxuICB9LFxyXG59KTtcclxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBjaGVjayB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgTGlua3MgZnJvbSAnLi4vY29sbGVjdGlvbnMvTGlua3MuanMnO1xuXG5NZXRlb3IubWV0aG9kcyh7XG4gICdjcmVhdGVMaW5rJyh0aXRsZSwgdXJsKSB7XG4gICAgY2hlY2sodXJsLCBTdHJpbmcpO1xuICAgIGNoZWNrKHRpdGxlLCBTdHJpbmcpO1xuXG4gICAgcmV0dXJuIExpbmtzLmluc2VydCh7XG4gICAgICB1cmwsXG4gICAgICB0aXRsZSxcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICB9KTtcbiAgfSxcbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSBcIm1ldGVvci9tZXRlb3JcIjtcclxuaW1wb3J0IHsgQ3VzdG9tZXIgfSBmcm9tIFwiLi4vY29sbGVjdGlvbnMvY29sbGVjdGlvbnNcIjtcclxuXHJcbk1ldGVvci5tZXRob2RzKHtcclxuICBcImN1c3RvbWVyLmluc2VydFwiKGRvYykge1xyXG4gICAgcmV0dXJuIEN1c3RvbWVyLmluc2VydChkb2MpO1xyXG4gIH0sXHJcbiAgXCJjdXN0b21lci5maW5kXCIoKSB7XHJcbiAgICByZXR1cm4gQ3VzdG9tZXIuZmluZCgpLmZldGNoKCk7XHJcbiAgfSxcclxuICBcImN1c3RvbWVyLnVwZGF0ZVwiKGRvYykge1xyXG4gICAgcmV0dXJuIEN1c3RvbWVyLnVwZGF0ZSh7IF9pZDogZG9jLl9pZCB9LCB7ICRzZXQ6IGRvYyB9KTtcclxuICB9LFxyXG4gIFwiY3VzdG9tZXIucmVtb3ZlXCIoaWQpIHtcclxuICAgIHJldHVybiBDdXN0b21lci5yZW1vdmUoeyBfaWQ6IGlkIH0pO1xyXG4gIH0sXHJcbn0pO1xyXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tIFwibWV0ZW9yL21ldGVvclwiO1xyXG5pbXBvcnQgbW9tZW50IGZyb20gXCJtb21lbnRcIjtcclxuaW1wb3J0IHsgSW1wb3J0LCBJdGVtLCBTdXBwbGllciB9IGZyb20gXCIuLi9jb2xsZWN0aW9ucy9jb2xsZWN0aW9uc1wiO1xyXG5cclxuTWV0ZW9yLm1ldGhvZHMoe1xyXG4gIFwiaW1wb3J0LmZpbmRCeURhdGVcIihkYXRlKSB7XHJcbiAgICBsZXQgZGF0YSA9IFtdO1xyXG4gICAgbGV0IGZyb21EYXRlID0gbW9tZW50KGRhdGUuZnJvbURhdGUsIFwiREQtTU0tWVlZWVwiKTtcclxuICAgIGxldCB0b0RhdGUgPSBtb21lbnQoZGF0ZS50b0RhdGUsIFwiREQtTU0tWVlZWVwiKTtcclxuICAgIEltcG9ydC5maW5kKCkuZm9yRWFjaCgoZG9jKSA9PiB7XHJcbiAgICAgIGxldCBpdGVtID0gZG9jO1xyXG4gICAgICBsZXQgZGF0ZSA9IG1vbWVudChkb2MuZGF0ZSwgXCJERC1NTS1ZWVlZXCIpO1xyXG4gICAgICBpZiAoZGF0ZSA+PSBmcm9tRGF0ZSAmJiBkYXRlIDw9IHRvRGF0ZSkge1xyXG4gICAgICAgIGl0ZW0ubmFtZSA9IEl0ZW0uZmluZE9uZSh7IF9pZDogZG9jLml0ZW1JZCB9KT8ubmFtZTtcclxuICAgICAgICBpdGVtLmNvbXBhbnkgPSBTdXBwbGllci5maW5kT25lKHsgX2lkOiBkb2Muc3VwcGxpZXJJZCB9KT8uY29tcGFueTtcclxuICAgICAgICBkYXRhLnB1c2goaXRlbSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGRhdGE7XHJcbiAgfSxcclxufSk7XHJcbiIsImltcG9ydCBcIi4vY3JlYXRlTGlua1wiO1xyXG5pbXBvcnQgXCIuL2N1c3RvbWVyXCI7XHJcbmltcG9ydCBcIi4vY2F0ZWdvcnlcIjtcclxuaW1wb3J0IFwiLi9pdGVtXCI7XHJcbmltcG9ydCBcIi4vc3VwcGxpZXJcIjtcclxuaW1wb3J0IFwiLi9wdXJjaGFzZVwiO1xyXG5pbXBvcnQgXCIuL2ludm9pY2VcIjtcclxuaW1wb3J0IFwiLi9pbXBvcnRcIjtcclxuaW1wb3J0IFwiLi91c2VyXCI7XHJcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gXCJtZXRlb3IvbWV0ZW9yXCI7XHJcblxyXG5NZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XHJcbiAgaWYgKE1ldGVvci51c2Vycy5maW5kKCkuY291bnQoKSA9PSAwKSB7XHJcbiAgICBsZXQgdXNlciA9IHtcclxuICAgICAgdXNlcm5hbWU6IFwiYWRtaW5cIixcclxuICAgICAgcGFzc3dvcmQ6IFwiYWRtaW5cIixcclxuICAgICAgZW1haWw6IFwiYWRtaW5AYWRtaW4uY29tXCIsXHJcbiAgICAgIHBob25lOiBcIjAxNzI5MjkxMlwiLFxyXG4gICAgICByb2xlOiBcImFkbWluXCIsXHJcbiAgICB9O1xyXG4gICAgTWV0ZW9yLmNhbGwoXCJ1c2VyLmNyZWF0ZVwiLCB1c2VyLCAoZXJyLCByZXN1bHQpID0+IHtcclxuICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiY3JlYXRlZCB1c2VyOlwiLCByZXN1bHQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn0pO1xyXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tIFwibWV0ZW9yL21ldGVvclwiO1xyXG5pbXBvcnQgbW9tZW50IGZyb20gXCJtb21lbnRcIjtcclxuaW1wb3J0IHsgRXhwb3J0LCBQdXJjaGFzZSwgSXRlbSwgQ3VzdG9tZXIgfSBmcm9tIFwiLi4vY29sbGVjdGlvbnMvY29sbGVjdGlvbnNcIjtcclxuXHJcbk1ldGVvci5tZXRob2RzKHtcclxuICBcImludm9pY2UubnVtYmVyXCIoKSB7XHJcbiAgICByZXR1cm4gRXhwb3J0LmZpbmQoKS5jb3VudCgpICsgMTtcclxuICB9LFxyXG4gIFwiaW52b2ljZS5pbnNlcnRcIihkb2MpIHtcclxuICAgIGxldCBzb2xkSXRlbXMgPSBkb2MuaXRlbXM7XHJcbiAgICBQdXJjaGFzZS5maW5kKCkuZm9yRWFjaCgoZG9jKSA9PiB7XHJcbiAgICAgIHNvbGRJdGVtcy5mb3JFYWNoKChzb2xkSXRlbSkgPT4ge1xyXG4gICAgICAgIGlmIChzb2xkSXRlbS5faWQgPT09IGRvYy5pdGVtSWQpIHtcclxuICAgICAgICAgIGxldCByZW1haW5RdHkgPSBkb2MucXR5IC0gc29sZEl0ZW0ucXR5O1xyXG4gICAgICAgICAgaWYgKHJlbWFpblF0eSA9PT0gMCkge1xyXG4gICAgICAgICAgICBQdXJjaGFzZS5yZW1vdmUoeyBfaWQ6IGRvYy5faWQgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBQdXJjaGFzZS51cGRhdGUoeyBfaWQ6IGRvYy5faWQgfSwgeyAkc2V0OiB7IHF0eTogcmVtYWluUXR5IH0gfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIEV4cG9ydC5pbnNlcnQoZG9jKTtcclxuICB9LFxyXG4gIFwiaW52b2ljZS5maW5kXCIoZGF0ZSkge1xyXG4gICAgbGV0IGRhdGEgPSBbXTtcclxuICAgIGxldCBmcm9tRGF0ZSA9IG1vbWVudChkYXRlLmZyb21EYXRlLCBcIkRELU1NLVlZWVlcIik7XHJcbiAgICBsZXQgdG9EYXRlID0gbW9tZW50KGRhdGUudG9EYXRlLCBcIkRELU1NLVlZWVlcIik7XHJcbiAgICBFeHBvcnQuZmluZCgpLmZvckVhY2goKGRvYykgPT4ge1xyXG4gICAgICBsZXQgZGF0ZSA9IG1vbWVudChkb2MuZGF0ZSwgXCJERC1NTS1ZWVlZXCIpO1xyXG4gICAgICBpZiAoZGF0ZSA+PSBmcm9tRGF0ZSAmJiBkYXRlIDw9IHRvRGF0ZSkge1xyXG4gICAgICAgIGxldCBuZXdEb2MgPSBkb2M7XHJcbiAgICAgICAgbmV3RG9jLmN1c3RvbWVyTmFtZSA9IEN1c3RvbWVyLmZpbmRPbmUoeyBfaWQ6IGRvYy5jdXN0b21lcklkIH0pPy5uYW1lO1xyXG4gICAgICAgIGxldCBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGRvYy5pdGVtcy5mb3JFYWNoKChpdCkgPT4ge1xyXG4gICAgICAgICAgaXQubmFtZSA9IEl0ZW0uZmluZE9uZSh7IF9pZDogaXQuX2lkIH0pPy5uYW1lO1xyXG4gICAgICAgICAgaXRlbXMucHVzaChpdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3RG9jLml0ZW1zID0gaXRlbXM7XHJcbiAgICAgICAgZGF0YS5wdXNoKG5ld0RvYyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY29uc29sZS5sb2coXCJkYXRhOlwiLCBkYXRhKTtcclxuICAgIHJldHVybiBkYXRhO1xyXG4gIH0sXHJcbn0pO1xyXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tIFwibWV0ZW9yL21ldGVvclwiO1xyXG5pbXBvcnQgeyBJdGVtLCBDYXRlZ29yeSB9IGZyb20gXCIuLi9jb2xsZWN0aW9ucy9jb2xsZWN0aW9uc1wiO1xyXG5cclxuTWV0ZW9yLm1ldGhvZHMoe1xyXG4gIFwiaXRlbS5pbnNlcnRcIihkb2MpIHtcclxuICAgIHJldHVybiBJdGVtLmluc2VydChkb2MpO1xyXG4gIH0sXHJcbiAgXCJpdGVtLmZpbmRcIigpIHtcclxuICAgIGxldCBkYXRhID0gW107XHJcbiAgICBJdGVtLmZpbmQoKVxyXG4gICAgICAuZmV0Y2goKVxyXG4gICAgICAuZm9yRWFjaCgoaXQpID0+IHtcclxuICAgICAgICBpdC5jYXRlZ29yeU5hbWUgPSBDYXRlZ29yeS5maW5kT25lKHsgX2lkOiBpdC5jYXRlZ29yeUlkIH0pPy5uYW1lO1xyXG4gICAgICAgIGRhdGEucHVzaChpdCk7XHJcbiAgICAgIH0pO1xyXG4gICAgcmV0dXJuIGRhdGE7XHJcbiAgfSxcclxuICBcIml0ZW0udXBkYXRlXCIoZG9jKSB7XHJcbiAgICByZXR1cm4gSXRlbS51cGRhdGUoeyBfaWQ6IGRvYy5faWQgfSwgeyAkc2V0OiBkb2MgfSk7XHJcbiAgfSxcclxuICBcIml0ZW0ucmVtb3ZlXCIoaWQpIHtcclxuICAgIHJldHVybiBJdGVtLnJlbW92ZSh7IF9pZDogaWQgfSk7XHJcbiAgfSxcclxufSk7XHJcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gXCJtZXRlb3IvbWV0ZW9yXCI7XHJcbmltcG9ydCB7IFB1cmNoYXNlLCBJbXBvcnQsIEl0ZW0gfSBmcm9tIFwiLi4vY29sbGVjdGlvbnMvY29sbGVjdGlvbnNcIjtcclxuXHJcbk1ldGVvci5tZXRob2RzKHtcclxuICBcInB1cmNoYXNlLmFkZFwiKGRvYykge1xyXG4gICAgbGV0IGltcG9ydERvYyA9IE9iamVjdC5hc3NpZ24oe30sIGRvYyk7XHJcbiAgICBsZXQgb2xkUHVyY2hhc2UgPSBQdXJjaGFzZS5maW5kT25lKHsgaXRlbUlkOiBkb2MuaXRlbUlkIH0pO1xyXG4gICAgaWYgKCFvbGRQdXJjaGFzZSkge1xyXG4gICAgICBpbXBvcnREb2MucmVtYWlucyA9IDA7XHJcbiAgICAgIEltcG9ydC5pbnNlcnQoaW1wb3J0RG9jKTtcclxuICAgICAgcmV0dXJuIFB1cmNoYXNlLmluc2VydChkb2MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaW1wb3J0RG9jLnJlbWFpbnMgPSBvbGRQdXJjaGFzZS5xdHk7XHJcbiAgICAgIEltcG9ydC5pbnNlcnQoaW1wb3J0RG9jKTtcclxuICAgICAgb2xkUHVyY2hhc2UucXR5ICs9IGRvYy5xdHk7XHJcbiAgICAgIG9sZFB1cmNoYXNlLmNvc3QgPSBkb2MuY29zdDtcclxuICAgICAgb2xkUHVyY2hhc2UucHJpY2UgPSBkb2MucHJpY2U7XHJcbiAgICAgIG9sZFB1cmNoYXNlLmRhdGUgPSBkb2MuZGF0ZTtcclxuICAgICAgcmV0dXJuIFB1cmNoYXNlLnVwZGF0ZSh7IF9pZDogb2xkUHVyY2hhc2UuX2lkIH0sIHsgJHNldDogb2xkUHVyY2hhc2UgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBcInB1cmNoYXNlLmZpbmRcIigpIHtcclxuICAgIGxldCBkYXRhID0gW107XHJcbiAgICBQdXJjaGFzZS5maW5kKCkuZm9yRWFjaCgoZG9jKSA9PiB7XHJcbiAgICAgIGxldCBpdGVtID0gZG9jO1xyXG4gICAgICBpdGVtLm5hbWUgPSBJdGVtLmZpbmRPbmUoeyBfaWQ6IGRvYy5pdGVtSWQgfSk/Lm5hbWU7XHJcbiAgICAgIGRhdGEucHVzaChpdGVtKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGRhdGE7XHJcbiAgfSxcclxufSk7XHJcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gXCJtZXRlb3IvbWV0ZW9yXCI7XHJcbmltcG9ydCB7IFN1cHBsaWVyIH0gZnJvbSBcIi4uL2NvbGxlY3Rpb25zL2NvbGxlY3Rpb25zXCI7XHJcblxyXG5NZXRlb3IubWV0aG9kcyh7XHJcbiAgICBcInN1cHBsaWVyLmluc2VydFwiKGRvYykge1xyXG4gICAgICAgIHJldHVybiBTdXBwbGllci5pbnNlcnQoZG9jKTtcclxuICAgIH0sXHJcbiAgICBcInN1cHBsaWVyLmZpbmRcIigpIHtcclxuICAgICAgICByZXR1cm4gU3VwcGxpZXIuZmluZCgpLmZldGNoKCk7XHJcbiAgICB9LFxyXG4gICAgXCJzdXBwbGllci51cGRhdGVcIihkb2MpIHtcclxuICAgICAgICByZXR1cm4gU3VwcGxpZXIudXBkYXRlKHsgX2lkOiBkb2MuX2lkIH0sIHsgJHNldDogZG9jIH0pO1xyXG4gICAgfSxcclxuICAgIFwic3VwcGxpZXIucmVtb3ZlXCIoaWQpIHtcclxuICAgICAgICByZXR1cm4gU3VwcGxpZXIucmVtb3ZlKHsgX2lkOiBpZCB9KTtcclxuICAgIH0sXHJcbn0pO1xyXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tIFwibWV0ZW9yL21ldGVvclwiO1xyXG5pbXBvcnQgeyBBY2NvdW50cyB9IGZyb20gXCJtZXRlb3IvYWNjb3VudHMtYmFzZVwiO1xyXG5NZXRlb3IubWV0aG9kcyh7XHJcbiAgXCJ1c2VyLmNyZWF0ZVwiKGRvYykge1xyXG4gICAgcmV0dXJuIEFjY291bnRzLmNyZWF0ZVVzZXIoe1xyXG4gICAgICB1c2VybmFtZTogZG9jLnVzZXJuYW1lLFxyXG4gICAgICBwYXNzd29yZDogZG9jLnBhc3N3b3JkLFxyXG4gICAgICBlbWFpbDogZG9jLmVtYWlsLFxyXG4gICAgICBwcm9maWxlOiB7XHJcbiAgICAgICAgcGhvbmU6IGRvYy5waG9uZSxcclxuICAgICAgICByb2xlOiBkb2Mucm9sZSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgXCJ1c2VyLnVwZGF0ZVwiKGRvYykge1xyXG4gICAgaWYgKGRvYy5yZXNldCkge1xyXG4gICAgICBBY2NvdW50cy5zZXRQYXNzd29yZChkb2MuX2lkLCBkb2MucGFzc3dvcmQpO1xyXG4gICAgfVxyXG4gICAgbGV0IGVtYWlscyA9IE1ldGVvci51c2Vycy5maW5kT25lKHsgX2lkOiBkb2MuX2lkIH0pLmVtYWlscztcclxuICAgIGVtYWlsc1swXS5hZGRyZXNzID0gZG9jLmVtYWlsO1xyXG4gICAgcmV0dXJuIE1ldGVvci51c2Vycy51cGRhdGUoXHJcbiAgICAgIHsgX2lkOiBkb2MuX2lkIH0sXHJcbiAgICAgIHtcclxuICAgICAgICAkc2V0OiB7XHJcbiAgICAgICAgICB1c2VybmFtZTogZG9jLnVzZXJuYW1lLFxyXG4gICAgICAgICAgZW1haWxzOiBlbWFpbHMsXHJcbiAgICAgICAgICBwcm9maWxlOiB7XHJcbiAgICAgICAgICAgIHBob25lOiBkb2MucGhvbmUsXHJcbiAgICAgICAgICAgIHJvbGU6IGRvYy5yb2xlLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH0sXHJcbiAgXCJ1c2VyLmZpbmRcIigpIHtcclxuICAgIGxldCBkYXRhID0gW107XHJcbiAgICBNZXRlb3IudXNlcnNcclxuICAgICAgLmZpbmQoKVxyXG4gICAgICAuZmV0Y2goKVxyXG4gICAgICAuZm9yRWFjaCgoaXQpID0+IHtcclxuICAgICAgICBsZXQgZG9jID0ge1xyXG4gICAgICAgICAgX2lkOiBpdC5faWQsXHJcbiAgICAgICAgICB1c2VybmFtZTogaXQudXNlcm5hbWUsXHJcbiAgICAgICAgICBlbWFpbDogaXQuZW1haWxzWzBdLmFkZHJlc3MsXHJcbiAgICAgICAgICBwaG9uZTogaXQucHJvZmlsZS5waG9uZSxcclxuICAgICAgICAgIHJvbGU6IGl0LnByb2ZpbGUucm9sZSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGRhdGEucHVzaChkb2MpO1xyXG4gICAgICB9KTtcclxuICAgIHJldHVybiBkYXRhO1xyXG4gIH0sXHJcbiAgXCJ1c2VyLnJlbW92ZVwiKGlkKSB7XHJcbiAgICByZXR1cm4gTWV0ZW9yLnVzZXJzLnJlbW92ZSh7IF9pZDogaWQgfSk7XHJcbiAgfSxcclxufSk7XHJcbiIsImltcG9ydCAnLi9saW5rcydcclxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgTGlua3MgZnJvbSAnLi4vY29sbGVjdGlvbnMvTGlua3MuanMnO1xuXG5NZXRlb3IucHVibGlzaCgnbGlua3MnLCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBMaW5rcy5maW5kKCk7XG59KTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IExpbmtzIGZyb20gJy4vY29sbGVjdGlvbnMvTGlua3MuanMnO1xuXG5NZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gIC8vIGlmIHRoZSBMaW5rcyBjb2xsZWN0aW9uIGlzIGVtcHR5XG4gIGlmIChMaW5rcy5maW5kKCkuY291bnQoKSA9PT0gMCkge1xuICAgIGNvbnN0IGRhdGEgPSBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiAnRG8gdGhlIFR1dG9yaWFsJyxcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly93d3cubWV0ZW9yLmNvbS90cnknLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogJ0ZvbGxvdyB0aGUgR3VpZGUnLFxuICAgICAgICB1cmw6ICdodHRwOi8vZ3VpZGUubWV0ZW9yLmNvbScsXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiAnUmVhZCB0aGUgRG9jcycsXG4gICAgICAgIHVybDogJ2h0dHBzOi8vZG9jcy5tZXRlb3IuY29tJyxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6ICdEaXNjdXNzaW9ucycsXG4gICAgICAgIHVybDogJ2h0dHBzOi8vZm9ydW1zLm1ldGVvci5jb20nLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICB9LFxuICAgIF07XG5cbiAgICBkYXRhLmZvckVhY2gobGluayA9PiBMaW5rcy5pbnNlcnQobGluaykpO1xuICB9XG59KTtcbiIsImltcG9ydCAnLi4vaW1wb3J0cy9hcGkvZml4dHVyZXMnXHJcbmltcG9ydCAnLi4vaW1wb3J0cy9hcGkvbWV0aG9kcydcclxuaW1wb3J0ICcuLi9pbXBvcnRzL2FwaS9wdWJsaWNhdGlvbnMnXHJcbiJdfQ==

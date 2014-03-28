define([
    'underscore'
], function(
    _
) {
'use strict';

function Collection(options) {
    this.collection = [];
    this._hashMap = {};
}

Object.defineProperties(Collection.prototype, {
    length: {get: function() { return this.collection.length; }},
    empty:  {get: function() { return !this.length; }},
    hasSelected: {
        get: function() {
            return this.collection.some(function(item) {
                return item.selected;
            });
        }
    },
    allSelected: {
        get: function() {
            return this.collection.every(function(item) {
                return item.selected;
            });
        }
    }
});

_.extend(Collection.prototype, {

    constructor: Collection,

    sort: function() {},

    getById: function(id) {
        return this._hashMap[id];
    },

    contains: function(item) {
        return item != null && (item.id in this._hashMap);
    },

    create: function(data) {
        throw new Error('Not implement create method!');
    },

    add: function(items) {
        // Transform to array
        items = [].concat(items);

        var updated = items.map(function(item) {
            var existed = this.getById(item.id);
            if (existed) {
                // Only copy
                existed.extend(item);
                return existed;
            }
            else {
                if (item._collection) {
                    // item = this.create(item.rawData);
                    item._collection.drop(item);
                }
                item._collection = this;
                this.collection.unshift(item);
                this._hashMap[item.id] = item;
                return item;
            }
        }, this);
        
        this.sort();
        return updated;
    },

    drop: function(items) {
        items = [].concat(items);
        items.forEach(function(item) {
            var index = this.collection.indexOf(item);
            if (index !== -1) {
                this.collection.splice(index, 1);
                item._collection = null;
                delete this._hashMap[item.id];
            }
        }, this);

        this.sort();

        return items;
    },

    clear: function() {
        this.drop(this.collection);
    },

    selectAll: function() {
        this.toggleSelectAll(true);
    },

    deselectAll: function() {
        this.toggleSelectAll(false);
    },

    toggleSelectAll: function(toBe) {
        toBe = arguments.length ? toBe : !this.allSelected;
        this.collection.forEach(function(item) {
            item.selected = toBe;
        });
    }
});

return Collection;

});

var view = require('../../lib/view');
var bulk = require('bulk-require');
var editorModels = bulk(
    __dirname + '/../../components/block-editors',
    '**/*.js');
var throttle = require('lodash.throttle');

var app = null;
var index = null;
var id = null;

// Rename editor components
for (id in editorModels) {
    if (editorModels.hasOwnProperty(id)) {
        editorModels[id + '-editor'] = editorModels[id];
        delete editorModels[id];
    }
}

id = null;

module.exports = view.extend({
    id: 'block',
    template: require('./index.html'),
    components: editorModels,
    data: {
        title: 'Edit'
    },
    methods: {
        remove: function (e) {
            e.preventDefault();
            app.remove(index);
            global.history.back();
        },
        getEditor: function (type) {
            var editorKey = type + '-editor';
            var defaultEditor = 'string-editor';
            var legalComponents = this.$compiler.options.components;
            if (legalComponents[editorKey]) {
                return editorKey;
            }
            return defaultEditor;
        }
    },
    created: function () {
        var self = this;

        id = self.$root.$data.params.id;
        index = self.$root.$data.params.index;

        // Navigation
        self.$data.back = '/make/' + id;

        // Fetch app
        app = self.$root.storage.getApp(id);
        if (app.data && app.data.blocks) {
            self.$root.isReady = true;
            self.$data.block = app.data.blocks[index];
        } else {
            self.$once(id, function (val) {
               self.$root.isReady = true;
               if (!val || !val.blocks) return;
               self.$data.block = val.blocks[index];
           });
        }

        self.$data.index = index;
        var onChange = throttle(function (newVal) {
            if (!newVal) return;
            var clone = JSON.parse(JSON.stringify(newVal));
            app.updateBlock(index, {
                attributes: clone
            });
        }, 3000);
        self.$watch('block.attributes', onChange);
    }
});

var app = {
  // Classes
  Collections: {},
  Models: {},
  Views: {},
  // Instances
  collections: {},
  views: {},
  init: function () {
    // Objects
    this.eventAggregator = {};
    _.extend(this.eventAggregator, Backbone.Events);
    // Loads

    this.views.main = new this.Views.Main({
      eventAggregator : this.eventAggregator
    });
    this.views.main.render();
  }
};


//-----------------------------------//
app.Views.JavascriptOutput = Backbone.View.extend({
    tagName: "div",
    className: "panel expand",    
    initialize : function(json) {
        _.bindAll(this, 'render');
        // Variables
        this.javascript = [];
        this.eventAggregator = json.eventAggregator;
        this.template = _.template($('#app-viewsOutput-template').html());
        // Events
        this.eventAggregator.on('javascriptUpdate', this.javascriptUpdate, this);
    },
    javascriptUpdate : function(javascript){
        this.javascript = javascript;
        this.render();
    },
    render : function(){
        $(this.el).html('');
        $(this.el).append(this.template({javascript : this.javascript}));
        prettyPrint();
        return this;
    }
});
//-----------------------------------//
app.Views.TemplateOutput = Backbone.View.extend({
    tagName: "div",
    className: "panel expand",    
    initialize : function(json) {
        _.bindAll(this, 'render');
        // Variables
        this.templates = [];
        this.eventAggregator = json.eventAggregator;
        this.template_output = _.template($('#app-templatesOutput-template').html());
        // Events
        this.eventAggregator.on('templatesUpdate', this.templatesUpdate, this);
    },
    templatesUpdate : function(templates){
        this.templates = templates;
        this.render();
    },
    render : function(){
        $(this.el).html('');
        console.log(this.templates)
        $(this.el).append(this.template_output({templates : this.templates}));
        prettyPrint();
        return this;
    }
});
//-----------------------------------//
app.Views.JsonEditor = Backbone.View.extend({
    tagName: "div",
    className: "",    
    initialize : function(json) {
        _.bindAll(this, 'render');
        // Variables
        // Template
        this.template = _.template($('#app-input-template').html());
    },
    
    render : function(){
        $(this.el).html('');
        $(this.el).append(this.template());

        return this;
    }
});
//-----------------------------------//
app.Views.Main = Backbone.View.extend({
    el: '#main',    
    initialize : function(json) {
        _.bindAll(this, 'render');
        // Variables
        this.eventAggregator = json.eventAggregator;
        this.templates = [];
        this.javascript = [];
        this.editor = "";
    },
    events : {
        "click .generate" : "generator",
        "change #json" : "jsonChange"
    },
    jsonChange : function(e) {
        e.preventDefault();
        var val = this.editor.getValue();
        if (val) {
            try { json = JSON.parse(val); }
            catch (e) { alert('Error in parsing json. ' + e); }
        } else {
            json = {};
        }
    },
    generator : function(e){
        e.preventDefault();
        // Parse into json
        $(this.el).find('.err').html('');
        var json = {};
        //try{
            json = JSON.parse(this.editor.getValue());
            $(this.el).find('.err').html('<span class="err success radius label">validated</span>');
            app.parseJsonArchyToHtml(json, this.templates, this.javascript);
            this.eventAggregator.trigger("javascriptUpdate",this.javascript);
            this.eventAggregator.trigger("templatesUpdate",this.templates);
        /*}
        catch(err){
            $(this.el).find('.err').html('<span class="err alert radius label">'+err+'</span>');
        }*/
    },
    render : function(){
        $(this.el).html('');
        // JsonEditor
        $(this.el).append(new app.Views.JsonEditor().render().el);
        // Template output
        $(this.el).append(new app.Views.TemplateOutput({eventAggregator : this.eventAggregator}).render().el);
        // Javascript output
        $(this.el).append(new app.Views.JavascriptOutput({eventAggregator : this.eventAggregator}).render().el);

        this.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
            lineNumbers: true,
            extraKeys: {"Ctrl-Space": "autocomplete"},
            mode: {name: "javascript", globalVars: true}
        });
        return this;
    }
});
//-----------------------------------//
// TODO:
app.parseJsonArchyToHtml = function(tree, templates, javascript){
    appName = tree.application;
    // App javascript
    javascript.unshift(app.parseJsonApplicationToHtml(appName,tree.branches[0].name));
    // For each branches
    tree.branches.forEach(function(branch){
        javascript.unshift(app.parseJsonViewToHtml(appName,branch,templates))
    });
}
//-----------------------------------//
// TODO:
app.parseJsonViewToHtml = function(appName,branch,templates){

    this.html = appName+".Views."+branch.name+" = Backbone.View.extend({\n"
    // Initialize  
    this.html+= "    initialize : function(json) {\n"
    this.html+= "        _.bindAll(this, 'render');\n"
    this.html+= "    },\n";
    // Events
    this.html+= "    events : {},\n"
    // Render
    this.html+= "    render : function(){\n"
    this.html+= "       $(this.el).html('');\n"
    this.html+= "       _this = this;\n"
    _this = this;
    branch.childs.forEach(function(child){
        console.log("child",child)
        if(child.relation == "1-1"){
            if(child.type == "view"){
                _this.html+= "        $(_this.el).append(new "+appName+".Views."+child.name+"({\n"
                _this.html+= "          tagName : '',\n"
                _this.html+= "          className : '',\n"
                _this.html+= "          collection : this.collection\n"
                _this.html+=  "       }).render().el);\n"
            }else if(child.type == "template"){
                templates.unshift(new getHtmlTemplate(appName,child.name,child.relation));
                _this.html+= "        template_"+child.name+" = _.template($('#"+appName+"_"+child.name+"_template').html());\n"
                _this.html+= "        $(_this.el).append(template_"+child.name+"({collection:this.collection.toJSON()}));\n"
            }
        }else if(child.relation == "1-*"){
            _this.html+= "        this.collection.each(function(model_){\n"
            if(child.type == "view"){
                _this.html+= "            $(_this.el).append(new "+appName+".Views."+child.name+"({\n"
                _this.hmlt+= "              tagName: '',\n"
                _this.hmlt+= "              className: '',\n"
                _this.hmlt+= "              model: model_,\n"
                _this.hmlt+= "            }).render().el);\n"
            }else if(child.type == "template"){
                templates.unshift(new getHtmlTemplate(appName,child.name,child.relation));
                _this.html+= "            template_"+child.name+" = _.template($('#"+appName+"_"+child.name+"_template').html());\n"
                _this.html+="             $(_this.el).append(template_"+child.name+"({model:model_.toJSON()}));\n"
            }
            _this.html+= "        });\n"
        }
    });
    this.html+= "        return this;\n"
    this.html+= "    }\n"
    // END
    this.html+= "});\n"
    return this.html;
}
//-----------------------------------//
// TODO: 
function getHtmlTemplate(appName,templateName,relation){
    this.html = "<script type='text/template' id='"+appName+"_"+templateName+"_template'>\n";
    if(relation == "1-1"){
        this.html += "  <% model %>\n";
    }else if(relation == "1-*"){
        this.html += "  <% _.each(collection, function(model, i) { %>\n"
        this.html += "      <% model %>-<% i %>\n"
        this.html += "  <% }); %>\n"
    }
    this.html += "</script>\n"
    return this.html;
  
}
//-----------------------------------//
// TODO: 
app.parseJsonApplicationToHtml = function(appName,firstViewName){
    this.html = "var "+appName+" = {\n"
    this.html+= "    Collections: {},\n"
    this.html+= "    Models: {},\n"
    this.html+= "    Views: {},\n"
    this.html+= "    collections: {},\n"
    this.html+= "    views: {},\n"
    this.html+= "    init: function () {\n";
    this.html+= "        this.views."+firstViewName+" = new this.Views."+firstViewName+"({\n";
    this.html+= "            model : this.model,\n";
    this.html+= "            collection : this.collection,\n"
    this.html+= "        });\n"
    this.html+= "        this.views."+firstViewName+".render();\n"
    this.html+= "    }\n"
    this.html+= "};\n";
    return this.html;
}
//-----------------------------------//

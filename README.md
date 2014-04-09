nested-backbone-views-generator
===============================

Simply describe your nested web architecture in JSON and this script will generate the Backbone code corresponding (views + templates)

# Introduction
The interface architecture of each web application can be represente as  a tree of views. You have the main view and its childs.

Take an example:  the FaceBook Timeline is composed by somes posts. Each post are composed by a main part: the content (img, description, …) and a sub part: the activities (comments, likes, …):

![alt text](https://github.com/ClemDelp/nested-backbone-views-generator/blob/master/assets/img/facebook_timeline.png?raw=true "facebook timeline architecture example")

The representation of the Timeline interface FaceBook as a tree of views  would be:

![alt text](https://github.com/ClemDelp/nested-backbone-views-generator/blob/master/assets/img/architecture_tree_1.png?raw=true "facebook timeline architecture tree")

Content and Activities are post’s nested views, and Post are the Timeline’s nested view, we have two nesting level.

With Backbone, views can manage templates to display a render. In our FaceBook Timeline example jute Content and Activities views manage templates to display their own HTML render:

![alt text](https://github.com/ClemDelp/nested-backbone-views-generator/blob/master/assets/img/architecture_tree_backbone.png?raw=true "facebook timeline architecture tree")


# Describe the tree interface 

With nested-backbone-views-generator you just have to describe this tree architecture into JSON format:
```javascript
{
  "name" : "Facebook_timeline", // Module name
  "children" : [
    {"name":"timeline","children":[ // Timeline view
      {"name":"post", "link" : "1-*", "type" : "view"}
    ]},
    {"name":"post", "children":[ // Post view
      {"name":"content","link":"1-1","type":"view"},
      {"name":"activities","link":"1-1","type":"view"}
    ]},
    {"name":"content","children":[ // Content view
      {"name":"content_template","link":"1-1","type":"template"} // Template to display the content
    ]},
    {"name":"comments","children":[ // Comments view
      {"name":"commentsList","link":"1-*","type":"template"}, // Template to display comments list
      {"name":"newCommentInput","link":"1-1","type":"template"} // Template to display the input form to add new comment
    ]}
  ]
}
```

# Result
## Namespace

You get the module's name space and the reference to the module's html container (el: "#timeline_container").

```javascript
var Facebook_timeline = {
    Collections: {},
    Models: {},
    Views: {},
    collections: {},
    views: {},
    init: function () {
        this.views.timeline = new this.Views.timeline({
            el : '#timeline_container',
            tagName : '',
            className : '',
            model : this.model,
            collection : this.collection,
        });
        this.views.timeline.render();
    }
};
```

## HTML Part

You get all templates you views need + the html element container referenced into the namespace declaration + the call to the module constructor.

```html
<script type='text/template' id='Facebook_timeline_newCommentInput_template'>
  <% model %>
</script>
 
 
<script type='text/template' id='Facebook_timeline_commentsList_template'>
  <% _.each(collection, function(model, i) { %>
      <% model %>-<% i %>
  <% }); %>
</script>
 
 
<script type='text/template' id='Facebook_timeline_content_template'>
  <% model %>
</script>
 
 
<div id="timeline_container"></div>
 
<script>
   $(document).ready(function(){
         Facebook_timeline.init();
   });
</script>
```

## Nested Backbone views

Here you have all views with the logic Backbone nesting views. 

```javascript
Facebook_timeline.Views.activities = Backbone.View.extend({
    initialize : function(json) {
        _.bindAll(this, 'render');
    },
    events : {},
    render : function(){
       $(this.el).html('');
       _this = this;
        this.collection.each(function(model_){
            template_commentsList = _.template($('#Facebook_timeline_commentsList_template').html());
             $(_this.el).append(template_commentsList({model:model_.toJSON()}));
        });
        template_newCommentInput = _.template($('#Facebook_timeline_newCommentInput_template').html());
        $(_this.el).append(template_newCommentInput({collection:this.collection.toJSON()}));
        return this;
    }
});
 
Facebook_timeline.Views.content = Backbone.View.extend({
    initialize : function(json) {
        _.bindAll(this, 'render');
    },
    events : {},
    render : function(){
       $(this.el).html('');
       _this = this;
        template_content_template = _.template($('#Facebook_timeline_content_template').html());
        $(_this.el).append(template_content_template({collection:this.collection.toJSON()}));
        return this;
    }
});
 
Facebook_timeline.Views.post = Backbone.View.extend({
    initialize : function(json) {
        _.bindAll(this, 'render');
    },
    events : {},
    render : function(){
       $(this.el).html('');
       _this = this;
        $(_this.el).append(new Facebook_timeline.Views.content({
          tagName : '',
          className : '',
          collection : this.collection
       }).render().el);
        $(_this.el).append(new Facebook_timeline.Views.activities({
          tagName : '',
          className : '',
          collection : this.collection
       }).render().el);
        return this;
    }
});
 
Facebook_timeline.Views.timeline = Backbone.View.extend({
    initialize : function(json) {
        _.bindAll(this, 'render');
    },
    events : {},
    render : function(){
       $(this.el).html('');
       _this = this;
        this.collection.each(function(model_){
            $(_this.el).append(new Facebook_timeline.Views.post({
        });
        return this;
    }
});
```

# Details
## How to declare a module

## How to link simple or mutliple nested views

## How to link one or multiple template to a view






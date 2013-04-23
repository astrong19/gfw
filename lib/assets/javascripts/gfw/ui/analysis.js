gfw.ui.model.AnalysisInfo = Backbone.Model.extend({ });

gfw.ui.view.AnalysisInfo = gfw.ui.view.Widget.extend({

  className: 'info_bar',

  initialize: function() {

    _.bindAll( this, "toggleDraggable", "onStopDragging");

    this.model.bind("change:draggable", this.toggleDraggable);
    this.model.bind("change:show", this._toggle, this);
    this.model.bind("change:closed",    this.toggleOpen);

    var template = $("#analysis-info-template").html();

    this.template = new gfw.core.Template({
      template: template,
      type: 'mustache'
    });

  },

  // INFO
  _toggle: function() {

    if (this.model.get("show")) this.$el.fadeIn(250);
    else this.$el.fadeOut(250);

  },

  show: function() {
    this.model.set("show", true);
  },

  hide: function() {
    this.model.set("show", false);
  },

  render: function() {

    this.$el.append(this.template.render( this.model.toJSON() ));

    return this.$el;

  }

});


gfw.ui.model.Analysis = Backbone.Model.extend({
  defaults: {

  }
});

gfw.ui.view.Analysis = gfw.core.View.extend({

  className: 'analysis',

  events: {
    'click a#analysis_control': '_onClickButton',
    'click a.done'            : '_onClickDone',
    'click a.cancel'          : '_onClickCancel'
  },

  initialize: function() {
    _.bindAll(this, "_onOverlayComplete");

    this.map = this.options.map;

    this.model = new gfw.ui.model.Analysis({});

    this.model.bind("change:toggleButton",  this._toggleButton, this);
    this.model.bind("change:toggleDoneButton",  this._toggleDoneButton, this);
    this.model.bind("change:toggleHelper",  this._toggleHelper, this);

    var template = $("#analysis-template").html();

    this.template = new gfw.core.Template({
      template: template,
      type: 'mustache'
    });
  },

  _setupDrawingManager: function() {
    var self = this;

    var options = {
      drawingModes: [ google.maps.drawing.OverlayType.POLYGON ],
      drawingControl: false,
      markerOptions: {
        draggable: false,
        icon: new google.maps.MarkerImage(
          '/assets/icons/marker_exclamation.png',
          new google.maps.Size(45, 45), // desired size
          new google.maps.Point(0, 0),  // offset within the scaled sprite
          new google.maps.Point(20, 20) // anchor point is half of the desired size
        )
      },

      drawingControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON, google.maps.drawing.OverlayType.MARKER]
      },

      polygonOptions: config.ANALYSIS_OVERLAYS_STYLE,
      panControl: false,
      map: self.map
    };

    // Create the drawing manager
    this.drawingManager = new google.maps.drawing.DrawingManager(options);

    // Start drawing right away
    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);

    // Event binding
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', this._onOverlayComplete);

  },

  _onOverlayComplete: function(e) {
    this.drawingManager.setDrawingMode(null);
    this.drawingManager.path = e.overlay.getPath().getArray();
    this.drawingManager.setOptions({ drawingControl: false });
    this._enableDoneButton();
  },

  _onClickButton: function(e) {
    e.preventDefault();

    this._showHelper();
    this._setupDrawingManager();
  },

  _onClickCancel: function(e) {

    e.preventDefault();
    e.stopPropagation();

    this._hideHelper();
  },

  // Done button
  _toggleDoneButton: function() {
    if (this.model.get("toggleDoneButton")) this.$doneButton.removeClass("disabled");
    else this.$doneButton.addClass("disabled");
  },

  _enableDoneButton: function() {
    this.model.set("toggleDoneButton", true);
  },

  _disableDoneButton: function() {
    this.model.set("toggleDoneButton", false);
  },

  _onClickDone: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._hideHelper();
    this.info.show();
  },

  // Helper
  _toggleHelper: function() {
    if (this.model.get("toggleHelper")) {
      this.$helper.fadeIn(250);

      if (GFW.app.currentBaseLayer == "semi_monthly") Timeline.hide();

      $(".legend").fadeOut(250);

    } else {
      this.$helper.fadeOut(250);

      if (GFW.app.currentBaseLayer == "semi_monthly") Timeline.show();

      $(".legend").fadeIn(250);
    }
  },

  _showHelper: function() {
    this.model.set("toggleHelper", true);
  },

  _hideHelper: function() {
    this.model.set("toggleHelper", false);
  },

  // Button
  _toggleButton: function() {
    if (this.model.get("toggleButton")) this.$button.fadeIn(250);
    else this.$button.fadeOut(250);

  },

  _showButton: function() {
    this.model.set("toggleButton", true);
  },

  _hideButton: function() {
    this.model.set("toggleButton", false);
  },

  render: function() {

    var that = this;

    this.$el.append(this.template.render( this.model.toJSON() ));

    this.$button = this.$("#analysis_control");
    this.$helper = this.$(".analysis.helper_bar");
    this.$doneButton = this.$(".done");

    var model = new gfw.ui.model.AnalysisInfo({
      show: false,
      title: "User defined area",
      subtitle: "Analysis from Nov 06 to Dec 10",
      ha: "1,201,291",
      alert_count: "15,384",
      alert_title: "Forma alerts"
    });

    this.info = new gfw.ui.view.AnalysisInfo({
      model: model
    });

    $("#map").append(this.info.render());
    this.info.setDraggable(true);

    return this.$el;

  }

});
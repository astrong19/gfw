/**
 * The timeline module.
 *
 * Timeline for all layers configured by setting layer-specific options.
 * 
 * @return Timeline class (extends Backbone.View).
 */
define([
  'backbone',
  'presenter',
  'moment',
  'd3',
  'text!map/templates/timeline.html'
], function(Backbone, presenter, moment, d3, timelineTpl) {

  var Timeline = Backbone.View.extend({

    className: 'timeline timeline-date-range',
    template: _.template(timelineTpl),

    events: {
      'click .play': 'onClickPlay'
    },

    initialize: function(opts) {
      _.bindAll(this, 'onAnimate', 'onBrush', 'onBrushEnd');

      this.opts = _.extend({
        dateRange: [moment([2001]), moment()],
        layerName: '',
        playSpeed: 400,
        xAxis: {
          months: {
            enabled: false,
            steps: false
          }
        }
      }, opts);

      // Status
      this.playing = false;

      // d3 slider objets
      this.svg = {};
      this.xscale = {};
      this.brush = {};
      this.slider = {};
      this.handlers = {
        left:{},
        right:{}
      };

      /**
       * Current extent position.
       * We use this because we need where the extent is going to be,
       * we can't get the values from the handlers because they
       * have animation.
       */
      this.ext = {
        left: 0,
        right: 0
      };

      this.render();
    },

    render: function() {
      this.$el.html(this.template());
      $('.map-container').append(this.el);

      // Cache
      this.$play = this.$el.find('.play');
      this.$playIcon = this.$el.find('.play-icon');
      this.$stopIcon = this.$el.find('.stop-icon');
      this.$time = this.$el.find('.time');

      this.renderSlider();
    },

    /**
     * Render d3 timeline slider.
     */
    renderSlider: function() {
      var self = this;
      var margin = {top: 0, right: 30, bottom: 0, left: 30};
      var width = 949 - margin.left - margin.right;
      var height = 50 - margin.bottom - margin.top;

      // Set xscale
      this.xscale = d3.scale.linear()
          .domain([this.opts.dateRange[0].year(), this.opts.dateRange[1].year()])
          .range([0, width])
          .clamp(true);

      this.ext.right = width;

      // Set brush and listeners
      this.brush = d3.svg.brush()
          .x(this.xscale)
          .extent([0, 0])
          .on("brush", function() {
            self.onBrush(this)
          })
          .on("brushend", function() {
            self.onBrushEnd(this);
          });

      // Set top svg
      this.svg = d3.select(this.$time[0]).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Bar, years
      this.svg.append("g")
          .attr("class", "xaxis")
          .attr("transform", "translate(0, " + (height / 2) + ")")
          .call(d3.svg.axis()
            .scale(this.xscale)
            .orient("top")
            .ticks(this.opts.dateRange[1].year() - this.opts.dateRange[0].year())
            .tickFormat(function(d) {return String(d); })
            .tickSize(0)
            .tickPadding(-4))
        .select(".domain").remove();

      this.svg.select(".xaxis").selectAll("g.line").remove();

      this.svg.select(".xaxis").selectAll("g.tick")
        .insert("rect", ":first-child")
        .attr("width", 30)
        .attr("height", 12)
        .attr("x", -15)
        .attr("y", -5)
        .attr("fill", "white");

      // Handlers
      this.slider = this.svg.append("g")
          .attr("class", "slider")
          .call(this.brush);

      this.handlers.left = this.slider.append("rect")
          .attr("class", "handle")
          .attr("transform", "translate(0," + (height / 2 - 6) + ")")
          .attr("width", 14)
          .attr("height", 14)
          .attr("x", 16)
          .attr("y", -1)
          .attr("rx", 2)
          .attr("ry", 2);

      this.handlers.right = this.handlers.left
         .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
         .attr('x', this.xscale(this.opts.dateRange[1].year()) - 30);

      this.slider.select(".background")
          .style("cursor", "pointer")
          .attr("height", height);

      // Tipsy
      this.tipsy = this.svg.append("g")
        .attr("class", "tipsy")
        .style("visibility", "hidden");

      this.trail = this.tipsy.append("svg:line")
        .attr("class", "trail")
        .attr("x1", this.handlers.right.attr("x"))
        .attr("x2", this.handlers.right.attr("x"))
        .attr("y1", 0)
        .attr("y2", height);

      this.tooltip = d3.select(this.$time[0]).append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden")
        .style("left", this.handlers.right.attr("x") + 'px')
        .text(this.opts.dateRange[0].year());

      // Hidden brush for the animation
      this.hiddenBrush = d3.svg.brush()
          .x(this.xscale)
          .extent([0, 0])
          .on("brush", function() {
            self.onAnimationBrush(this)
          })
          .on("brushend", function() {
            self.onAnimationBrushEnd(this);
          });

      this.svg.selectAll(".extent,.resize")
          .remove();

      this.domain = this.svg.select(".xaxis")
        .insert("svg:line", ":first-child")
        .attr("class", "domain")
        .attr("x1", this.handlers.left.attr("x"))
        .attr("x2", this.handlers.right.attr("x"));

      this.formatXaxis();
    },

    /**
     * Event fired when user clicks play/stop button.
     */
    onClickPlay: function(event) {
      if (this.playing) {
        this.stopAnimation();
      } else {
        this.animate();
      }
    },

    stopAnimation: function() {
      // End animation extent hiddenBrush
      // this will call onAnimationBrushEnd
      this.trail
        .call(this.hiddenBrush.event)
        .interrupt();
    },

    /**
     * Play the timeline by extending hiddenBrush with d3 animation.
     */
    animate: function() {
      var hlx = this.handlers.left.attr("x");
      var hrx = this.handlers.right.attr("x");
      var trailFrom = Math.round(this.xscale.invert(hlx)) + 1; // +1 year left handler
      var trailTo = Math.round(this.xscale.invert(hrx));

      if (trailTo == trailFrom) {
        return;
      }

      var speed = (trailTo - trailFrom) * this.opts.playSpeed;

      this.togglePlayIcon();
      this.playing = true;
      this.yearsArr = []; // clean years

      this.showTipsy();
      this.hiddenBrush.extent([trailFrom, trailFrom]);

      // Animate extent hiddenBrush to trailTo
      this.trail
          .call(this.hiddenBrush.event)
        .transition()
          .duration(speed)
          .ease("line")
          .call(this.hiddenBrush.extent([trailFrom, trailTo]))
          .call(this.hiddenBrush.event);
    },

    /**
     * Event fired when timeline is being played.
     * Updates handlers positions and timeline date when reach a year.
     */
    onAnimationBrush: function(event) {
      var value = this.hiddenBrush.extent()[1];
      var roundValue = Math.round(value); // current year

      // yearsArr keep track of the years already loaded.
      // reason to do this is that value is never an
      // absolute value so we don't know when the trail
      // is in the right position.
      if (this.yearsArr.indexOf(roundValue) < 0 &&
        roundValue > 0) {

        // Move domain right
        this.domain
          .attr("x2", this.xscale(roundValue) - 16 - 8);

        // Move trail
        this.trail
          .attr("x1", this.xscale(roundValue) - 16 - 8)
          .attr("x2", this.xscale(roundValue) - 16 - 8);

        // Move && update tooltip
        this.tooltip
          .text(roundValue)
          .style("left", this.xscale(roundValue) - 16 - 8 + "px");

        this.formatXaxis();

        // Update timeline
        var startYear = Math.round(this.xscale.invert(this.handlers.left.attr("x")));
        this.updateTimelineDate([moment([startYear]), moment([roundValue])]);

        this.yearsArr.push(roundValue);
      }
    },

    onAnimationBrushEnd: function (event){
      var value = this.hiddenBrush.extent()[1];
      var hrl = this.ext.left;
      var trailFrom = Math.round(this.xscale.invert(hrl)) + 1; // +1 year left handler

      if (value > 0 && value !==  trailFrom) {
        this.togglePlayIcon();
        this.playing = false;
      }
    },

    /**
     * Event fired when user click anywhere on the timeline
     * and keep pressing.
     * Updates just handlers positions.
     */
    onBrush: function(event) {
      var value = this.xscale.invert(d3.mouse(event)[0]);
      var roundValue = Math.round(value);
      
      var xl = this.handlers.left.attr("x");
      var xr = this.handlers.right.attr("x");

      this.hideTipsy();

      if (this.playing) {
        this.stopAnimation();
      }

      if (Math.abs(this.xscale(value) - xr - 30) <
        Math.abs(this.xscale(value) - xl + 16)) {
        if (this.ext.left > this.xscale(roundValue)) return;
        this.ext.right = this.xscale(roundValue);

        this.domain
          .attr("x1", this.ext.left + 16);

        // Move right handler
        this.handlers.right
          .transition()
          .duration(100)
          .ease('line')
          .attr("x", this.xscale(roundValue) - 30);

        // Move domain right
        this.domain
          .transition()
          .duration(100)
          .ease("line")
          .attr("x2", this.xscale(roundValue) - 30);

      } else {
        if (this.ext.right < this.xscale(roundValue)) return;
        this.ext.left = this.xscale(roundValue);

        this.domain
          .attr("x2", this.ext.right - 30);

        // Move left handler
        this.handlers.left
          .transition()
          .duration(100)
          .ease('line')
          .attr("x", this.xscale(roundValue) + 16);

        // Move domain left
        this.domain
          .transition()
          .duration(100)
          .ease("line")
          .attr("x1", this.xscale(roundValue) + 16);
      }

      this.formatXaxis();
    },

    formatXaxis: function() {
      var self = this;

      d3.select(".xaxis").selectAll("text").filter(function(d, i) {
        var x1 = self.ext.left + 16;
        var x2 = self.ext.right + 30;
        if (d > Math.round(self.xscale.invert(x1)) &&
          d < Math.round(self.xscale.invert(x2))) {
          d3.select(this).classed("selected", true);
        } else {
          d3.select(this).classed("selected", false);
        }
      });
    },

    /**
     * Event fired when user ends the click.
     * Update the timeline date. (calls updateTimelineDate)
     */
    onBrushEnd: function(event) {
      var startYear = Math.round(this.xscale.invert(this.handlers.left.attr("x")));
      var endYear = Math.round(this.xscale.invert(this.handlers.right.attr("x")));
      // give time to finish animations.
      setTimeout(function() {
        this.updateTimelineDate([moment([startYear]), moment([endYear])]);
      }.bind(this), 100);
    },

    /**
     * Update the timeline.
     *
     * @param  {array} Date range
     */
    updateTimelineDate: function(timelineDate) {
      presenter.set('timelineDate', timelineDate);
    },

    togglePlayIcon: function() {
      this.$playIcon.toggle();
      this.$stopIcon.toggle();
    },

    showTipsy: function() {
      this.tipsy.style("visibility", "visible");
      this.tooltip.style("visibility", "visible");
    },

    hideTipsy: function() {
      this.tipsy.style("visibility", "hidden");
      this.tooltip.style("visibility", "hidden");
    }
  });

  return Timeline;

});
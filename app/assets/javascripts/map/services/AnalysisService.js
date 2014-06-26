/**
 * The analysis module.
 *
 * To get analysis results from this module, first subscribe to the
 * 'analysis/get-results' topic
 * To get analysis results, publish the 'analysis/get' event and pass in a
 * config object with analysis parameters:
 *
 * 
 */
define([
  'jquery',
  'underscore',
  'mps',
  'nsa',
  'Class',
  'uri'
], function ($, _, mps, nsa, Class, UriTemplate) {
  
  var Analysis = Class.extend({
    
    // URI templates for API
    apis: {
      global: "http://{0}/forest-change/{1}{?period,geojson,download,bust,dev}",
      national: "http://{0}/forest-change/{1}/admin{/iso}{?period,download,bust,dev}",
      subnational: "http://{0}/forest-change/{1}/admin{/iso}{/id1}{?period,download,bust,dev}",
      use: "http://{0}/forest-change/{1}/use/{/name}{/id}{?period,download,bust,dev}",
      wdpa: "http://{0}/forest-change/{1}/wdpa/{/id}{?period,download,bust,dev}"
    },

    init: function() {
      mps.subscribe('analysis/get', _.bind(function(config, cache) {
        this.execute(config, cache);
      }, this));
    },

    /**
     * Return URI template for API based on supplied config object of parameters.
     * 
     * @param  {object} API parameters
     * @return {string} URI template for API
     */
    get_uritemplate: function(config) {
      if (_.has(config, 'iso') && !_.has(config, 'id1')) {
        return this.apis.national;
      } else if (_.has(config, 'iso') && _.has(config, 'id1')) {
        return this.apis.subnational;
      } else if (_.has(config, 'use')) {
        return this.apis.use;
      } else if (_.has(config, 'wdpa')) {
        return this.apis.wdpa;
      } else {
        return this.apis.global;
      }
    },

    /**
     * Gets the API host.
     * 
     * @return {string} the API host
     */
    get_api_host: function() {
      // return 'localhost:8080';
      return 'beta.gfw-apis.appspot.com';
    },

    /**
     * Returns API URL from supplied config object of API parameters.
     * 
     * @param  {object} config API parameters
     * @return {string} API URL
     */
    get_url: function(config) {
      var template = this.get_uritemplate(config);
      var host = this.get_api_host();
      var url = null;
      
      template = template.format(host, config.layerName);
      url = new UriTemplate(template).fillFromObject(config);
      
      return url;
    },

    /**
     * Executes analysis.
     * 
     * @param  {[type]} config object
     *   layerName - layer name (e.g., forma-alerts)
     *   period - beginyear,endyear (e.g., 2001,2002)
     *   download - filename.format (e.g., forma.shp)
     *   geojson - GeoJSON Polygon or Multipolygon
     *   iso - 3 letter country ISO code (e.g., BRA)
     *   id1 - GADM subational id (e.g., 3445)
     *   use - Concession name (e.g., logging, mining, oilpalm, fiber)
     *   useid - Concession polygon cartodb_id (e.g., 2)
     *   wdpa - WDPA polygon cartodb_id (e.g., 800)
     */
    execute: function(config, cache) {
      var url = this.get_url(config);

      nsa.spy(
        url, 
        {}, 
        function(response) {
          mps.publish('analysis/get-success', [response]);
        },
        function(responseText, status, error) {
          mps.publish('analysis/get-failure', [responseText, status, error]);
        },
        cache);
    }
  });

  var analysis = new Analysis();

  return analysis;
});
//= require jquery/dist/jquery
//= require geojson
//= require d3/d3
//= require topojson/topojson
//= require scrollIt.min
//= require jquery.qtip.min
//= require simple_statistics

//= require gfw
//= require gfw/helpers
//= require gfw/ui/widget
//= require gfw/ui/sourcewindow
//= require gfw/ui/share
//= require gfw/ui/umd_options

//= require_tree ./search


$(document).ready(function() {
  //SearchBox
  window.search_index = new gfw.ui.view.SearchIndex();
});

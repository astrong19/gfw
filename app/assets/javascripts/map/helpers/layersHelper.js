/**
 * Map layers slug with layer files. (like views and dialog templates)
 */
define([
  // Layer views
  'map/views/layers/LossLayer',
  'map/views/layers/ForestGainLayer',
  'map/views/layers/FormaLayer',
  'map/views/layers/FormaCoverLayer',
  'map/views/layers/ImazonLayer',
  'map/views/layers/ImazonCoverLayer',
  'map/views/layers/ModisLayer',
  'map/views/layers/ModisCoverLayer',
  'map/views/layers/FiresLayer',
  'map/views/layers/Forest2000Layer',
  'map/views/layers/IntactForestLayer',
  'map/views/layers/IntactForestLayer2000',
  'map/views/layers/IntactForestLayer2013',
  'map/views/layers/PantropicalLayer',
  'map/views/layers/IdnPrimaryLayer',
  'map/views/layers/LoggingLayer',
  'map/views/layers/MiningLayer',
  'map/views/layers/OilPalmLayer',
  'map/views/layers/WoodFiberPlantationsLayer',
  'map/views/layers/ProtectedAreasLayer',
  'map/views/layers/ProtectedAreasCDBLayer',
  'map/views/layers/BiodiversityHotspotsLayer',
  'map/views/layers/ResourceRightsLayer',
  'map/views/layers/LandRightsLayer',
  'map/views/layers/UserStoriesLayer',
  'map/views/layers/MongabayStoriesLayer',
  'map/views/layers/InfoamazoniaStoriesLayer',
  'map/views/layers/GrumpLayer',
  'map/views/layers/MangroveLayer',
  // Layer dialog templates
  'text!templates/dialogs/loss_dialog.handlebars',
  // Layers timelines
  'map/views/timeline/LossTimeline',
  'map/views/timeline/FormaTimeline',
  'map/views/timeline/ImazonTimeline',
  'map/views/timeline/ModisTimeline',
  'map/views/timeline/FiresTimeline',
], function(
  // Layer Views
  LossLayer,
  ForestGainLayer,
  FormaLayer,
  FormaCoverLayer,
  ImazonLayer,
  ImazonCoverLayer,
  ModisLayer,
  ModisCoverLayer,
  FiresLayer,
  Forest2000Layer,
  IntactForestLayer,
  IntactForestLayer2000,
  IntactForestLayer2013,
  PantropicalLayer,
  IdnPrimaryLayer,
  LoggingLayer,
  MiningLayer,
  OilPalmLayer,
  WoodFiberPlantationsLayer,
  ProtectedAreasLayer,
  ProtectedAreasCDBLayer,
  BiodiversityHotspotsLayer,
  ResourceRightsLayer,
  LandRightsLayer,
  UserStoriesLayer,
  MongabayStoriesLayer,
  InfoamazoniaStoriesLayer,
  GrumpLayer,
  MangroveLayer,
  // Layer dialog templates
  loss_dialog,
  // Layer timelines
  LossTimeline,
  FormaTimeline,
  ImazonTimeline,
  ModisTimeline,
  FiresTimeline) {

  'use strict';

  var layersHelper = {
    loss: {
      view: LossLayer,
      dialogTpl: loss_dialog,
      timelineView: LossTimeline
    },
    forestgain: {
      view: ForestGainLayer
    },
    forma: {
      view: FormaLayer,
      timelineView: FormaTimeline
    },
    forma_cover: {
      view: FormaCoverLayer
    },
    imazon: {
      view: ImazonLayer,
      timelineView: ImazonTimeline
    },
    imazon_cover: {
      view: ImazonCoverLayer
    },
    modis: {
      view: ModisLayer,
      timelineView: ModisTimeline
    },
    modis_cover: {
      view: ModisCoverLayer
    },
    fires: {
      view: FiresLayer,
      timelineView: FiresTimeline
    },
    forest2000: {
      view: Forest2000Layer
    },
    intact_forest: {
      view: IntactForestLayer
    },
    ifl_2000: {
      view: IntactForestLayer2000
    },
    ifl_2013_deg: {
      view: IntactForestLayer2013
    },
    pantropical: {
      view: PantropicalLayer
    },
    idn_primary: {
      view: IdnPrimaryLayer
    },
    logging: {
      view: LoggingLayer
    },
    mining: {
      view: MiningLayer
    },
    oil_palm: {
      view: OilPalmLayer
    },
    wood_fiber_plantations: {
      view: WoodFiberPlantationsLayer
    },
    protected_areas: {
      view: ProtectedAreasLayer
    },
    protected_areasCDB: {
      view: ProtectedAreasCDBLayer
    },
    biodiversity_hotspots: {
      view: BiodiversityHotspotsLayer
    },
    resource_rights: {
      view: ResourceRightsLayer
    },
    land_rights: {
      view: LandRightsLayer
    },
    user_stories: {
      view: UserStoriesLayer
    },
    mongabay: {
      view: MongabayStoriesLayer
    },
    infoamazonia: {
      view: InfoamazoniaStoriesLayer
    },
    grump2000 :{
      view: GrumpLayer
    },
    mangrove :{
      view: MangroveLayer
    },
    nothing: {
    }
  };

  return layersHelper;

});

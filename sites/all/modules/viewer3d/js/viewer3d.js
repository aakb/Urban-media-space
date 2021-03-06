$(document).ready(function() { 
  var viewerSettings = Drupal.settings.viewer3d;
  swfobject.embedSWF(viewerSettings['flash_location']+'/swf_viewer/BuildingViewer.swf',
                     "building-viewer",
                     "940",
                     "666",
                     "10.0.22",
                     viewerSettings['flash_location']+"/scripts/expressInstall.swf",
                     {width:'940',DaluxBuildingViewServerURL:viewerSettings['data']+'&OverviewURL='+viewerSettings['overviewURL']+'&currentLocation='+viewerSettings['currentLocation']+'&angle='+viewerSettings['angle']+'&angle2='+viewerSettings['angle2']+'&showTopBar='+viewerSettings['showTopBar']+'&showLog='+viewerSettings['showLog']+'&informationPoints='+viewerSettings['infoPoints']+'&markerSize='+viewerSettings['markerSize']+'&markerMinSize='+viewerSettings['markerMinSize']+'&rotationSpeed='+viewerSettings['rotationSpeed']+'&mouseOutsideFlash=true'},
                     {allowFullScreen:"true", allowScriptAccess:"sameDomain", wmode: view3dGetWMode()});

  // Configure qtip, see: http://craigsworks.com/projects/qtip/docs/
  $('#building-viewer-nav-wrapper li a').qtip({
      position: {
      corner: {
         target: 'topMiddle',
         tooltip: 'bottomMiddle'
      },
      adjust: {
        y: -5
      }
    },
    style: {
      name: 'dark',
      background: '#333',
      fontSize: '11px',
      border: {
        radius: 3,
        width: 0
      },
      tip: {
        corner: 'bottomMiddle',
        size: {x: 7, y: 5}
      }
    }
  });
  
  // Hide information on load
  $('#building-viewer-point-information').hide();

  // Set rute information.
  var route = Drupal.settings.viewer3d_route;
  
  // Set current point, its update by view3dLocationChanged event
  viewer3d_current_point = viewerSettings['currentLocation'];

  // Set prev and next
  $('#building-viewer-nav .previous').click(function() {
    if (route[viewer3d_current_point].prev.jump) {
      viewer3dGotoLocationDefaultDirection(route[viewer3d_current_point].prev.pid);
    }
    else {
      viewer3dFlyToLocation(route[viewer3d_current_point].prev.pid);
    }
    return false;
  });
  $('#building-viewer-nav .next').click(function() {
    if (route[viewer3d_current_point].next.jump) {
      viewer3dGotoLocationDefaultDirection(route[viewer3d_current_point].next.pid);
    }
    else {
      viewer3dFlyToLocation(route[viewer3d_current_point].next.pid);
    }
    return false;
  });

  // Full screen (not used yet)
  $('#building-viewer-full-screen').click(function() {
    $('#building-viewer-outer-wrapper').css('z-index',99);
    
    Shadowbox.open({
        content:    $('#building-viewer-outer-wrapper').html(),
        player:     "html",
        title:      "3D viewer",
        height:     $(window).height(),
        width:      $(window).width()
    }); 

    return false;

  });

  // Help link
  $('#building-viewer-nav .help').click(function() {
    viewerToggleHelp();
    return false;
  });
  
  // Help link
  $('.start-3dviewer').click(function() {
    viewerToggleHelp();
    return false;
  });

  // Bind to starting point title link.
  $('#building-viewer-point-title a').click(function() {
    if (viewer3d_click) {
      viewer3d_click = false;
      viwer3dInfoShow = true;
      viewer3dRotateToDefaultDirection();
      return false;
    }
    return false;
  });

  // Close information link
  $('a.building-viewer-close').click(function() {
    $(this).parent().fadeOut();
    viewerToggleOverlay();
    return false;
  });

  // Set tooltip on point placeholder.
  // Configure qtip, see: http://craigsworks.com/projects/qtip/docs/
  $('#building-viewer-point-tip [title], #building-viewer-overview-point-tip [title]').qtip({
      position: {
      corner: {
         target: 'topMiddle',
         tooltip: 'bottomMiddle'
      },
      adjust: {
        y: -5
      }
    },
    content: {
      text: Drupal.t('Go here'),
      prerender: true
    },
    style: {
      name: 'dark',
      background: '#333',
      fontSize: '11px',
      border: {
        radius: 3,
        width: 0
      },
      tip: {
        corner: 'bottomMiddle',
        size: {x: 7, y: 5}
      }
    }
  });

  $('#building-viewer-point-tip a').click(function() {
    $(this).qtip("hide");
    viewer3dFlyToLocation(viewer3d_current_point_clicked);
    return false;
  });
  
  $('#building-viewer-overview-point-tip a').click(function() {
    $(this).qtip("hide");
    viewer3dGotoLocationDefaultDirection(viewer3d_current_point_clicked);
    return false;
  });  
  
  // Close overlay on click
  $('.building-viewer-overlay').click(function() {
    $('#building-viewer-point-information').fadeOut();
    $('#building-viewer-help').hide();
    viewerToggleOverlay();
  });
  
  $('#building-viewer-nav li.menu').click(function(){
    return false;
  });  

  $('.download a').click(function(e) {
    viewer3dSnapshot();
    e.preventDefault();
    return false;
  });
    
});

/**********************
 * API IMPLEMENTATION *
 **********************/

function viewer3dsetLabels() {
  app = viewer3dGetObject('building-viewer');
  if (!app) {
    app = viewer3dGetObject('BuildingViewer');
    if (!app) {
      app = viewer3dGetObject('BuildingViewer-name');
      if (!app)
        alert("not found");
        return;
    }
  }

  app.setLabels([1,2,8], ['Køkken', 'Bad', 'Soveværelse']);
}

function viewer3dSnapshot(){
  var app = viewer3dMovie('BuildingViewer');
  app = viewer3dGetObject('building-viewer');
  if (!app) {
    app = viewer3dGetObject('BuildingViewer');
    if (!app) {
      app = viewer3dGetObject('BuildingViewer-name');
      if (!app)
        alert("not found");
        return;
    }
  }
  
  var viewerSettings = Drupal.settings.viewer3d;
  var imageBase64 = app.snapshot();
  
  $.post(viewerSettings.path + '/download', {data: imageBase64}, function(data) {
    window.location = data;
  });
}

function viewer3dGotoLocation(pos, angle, angle2) {
  var app = viewer3dMovie('BuildingViewer');
  app = viewer3dGetObject('building-viewer');
  if (!app) {
    app = viewer3dGetObject('BuildingViewer');
    if (!app) {
      app = viewer3dGetObject('BuildingViewer-name');
      if (!app)
        alert("not found");
        return;
    }
  }
  app.gotoLocation(pos, angle, angle2);
}

function viewer3dGetObject(obj) {
  var theObj;
  if (document.all) {
    if (typeof obj == "string") {
      return document.all(obj);
    } else {
      return obj.style;
    }
  }
  if (document.getElementById) {
    if (typeof obj == "string") {
      return document.getElementById(obj);
    } else {
      return obj.style;
    }
  }
  return null;
}

function viewer3dGotoLocationDefaultDirection(pos) {
  var app = viewer3dMovie('BuildingViewer');
  app = viewer3dGetObject('building-viewer');
  if (!app) {
    app = viewer3dGetObject('BuildingViewer');
    if (!app) {
      app = viewer3dGetObject('BuildingViewer-name');
      if (!app)
        alert("not found");
        return;
    }
  }
  app.gotoLocationDefaultDirection(pos);
}

function viewer3dFlyToLocation(pos) {
  var app = viewer3dMovie('BuildingViewer');
  app = viewer3dGetObject('building-viewer');
  if (!app) {
    app = viewer3dGetObject('BuildingViewer');
    if (!app) {
      app = viewer3dGetObject('BuildingViewer-name');
      if (!app)
        alert("not found");
        return;
    }
  }
  app.flyToLocation(pos);
}

function viewer3dRotateToDefaultDirection() {
  var app = viewer3dMovie('BuildingViewer');
  app = viewer3dGetObject('building-viewer');
  if (!app) {
    app = viewer3dGetObject('BuildingViewer');
    if (!app) {
      app = viewer3dGetObject('BuildingViewer-name');
      if (!app)
        alert("not found");
        return;
    }
  }
  app.rotateToDefaultDirection();
}

function viewer3dCreateJumpPoint(jumpName, pos, angle1, angle2) {
  var app = viewer3dMovie('BuildingViewer');
  app = viewer3dGetObject('building-viewer');
  if (!app) {
    app = viewer3dGetObject('BuildingViewer');
    if (!app) {
      app = viewer3dGetObject('BuildingViewer-name');
      if (!app)
        alert("not found");
        return;
    }
  }
  app.createJumpPoint(jumpName, pos, angle1, angle2);
}


function viewer3dCreateLoadPoint(jumpName, url) {
  var app = viewer3dMovie('BuildingViewer');
  app = viewer3dGetObject('building-viewer');
  if (!app) {
    app = viewer3dGetObject('BuildingViewer');
    if (!app) {
      app = viewer3dGetObject('BuildingViewer-name');
      if (!app)
        alert("not found");
        return;
    }
  }
  app.createLoadPoint(jumpName, url);
}

function viewer3dSetPointLabel(point, label) {
  var app = viewer3dMovie('BuildingViewer');
  app = viewer3dGetObject('building-viewer');
  if (!app) {
    app = viewer3dGetObject('BuildingViewer');
    if (!app) {
      app = viewer3dGetObject('BuildingViewer-name');
      if (!app)
        alert("not found");
        return;
    }
  }
  app.setPointLabel(point, label);
}

function viewer3dMovie(movieName) {
  // IE and Netscape refer to the movie object differently.
  // This function returns the appropriate syntax depending on the browser.
  var IE = /*@cc_on!@*/false

  if (IE) {
    return window[movieName];
  } else {
    return window.document[movieName];
  }
}
/*****************************
 * END OF API IMPLEMENTATION *
 *****************************/

/****************************
 * MOVIE CALLBACK FUNCTIONS *
 ****************************/
function view3dLocationChanged(id) {
  viewer3d_current_point = id;
  
  if (Drupal.settings.viewer3d_route[id].type == 'MidwayPoint') {
    $('#building-viewer-point-title').hide();
  } else {
    $('#building-viewer-point-title').show();    
  }

  // Try to find information in the cache
  var title = jQuery.data(document.body, "title_"+id);
  if (title) {
    view3dUpdateTitle(title);
  }
  else {
    var viewerSettings = Drupal.settings.viewer3d;
    $.get(viewerSettings['path'] + '/ajax/title/' + id, function(data) {
      data = Drupal.parseJson(data);
      // Save information in cache.
      jQuery.data(document.body, 'title_'+id, data.value);
      view3dUpdateTitle(data.value);
    });
  }
}

function view3DLoaded() {
  // Only show helper text, if it's the first time the viewer is shown.
  if (!$.cookie('viewer3d_help')) {
    viewerToggleHelp();
  }
  $.cookie('viewer3d_help', 1);

  // Set labels for infopoints and tooltips.
  viewer3dsetLabels();
}

function view3dPointClicked(id, x, y) {
 
}

function view3dMoved() {

}

function view3dInfoClicked(id) {
  alert("Info bar clicked. Id: " + id);
}

function view3dMouseOverPoint(id, x, y, height) {
  // qtip blocks flash point, so save the id to get around this.
  viewer3d_current_point_clicked = id;

  // Get point title.
  if (Drupal.settings.viewer3d_route[id].type == 'MidwayPoint') {
    // Set a default title for midway points.
    view3dUpdateTip(Drupal.t('Go here'), x, y);
  }
  else {
    // Look up local cache for the title.
    var title = jQuery.data(document.body, "title_tip_"+id);
    if (title) {
      view3dUpdateTip(title, x, y);
    }
    else {
      // Ask the backend for a title.
      var viewerSettings = Drupal.settings.viewer3d;
      $.get(viewerSettings['path'] + '/ajax/title/' + id + '/0', function(data) {
        data = Drupal.parseJson(data);
        jQuery.data(document.body, 'title_tip_' + id, data.value);
        view3dUpdateTip(data.value, x, y);
      });
    }
  }
}

function view3dOverviewMouseOverPoint(id, x, y, height) {
  // qtip blocks flash point, so save the id to get around this.
  viewer3d_current_point_clicked = id;

  // Get point title.
  if (Drupal.settings.viewer3d_route[id].type == 'MidwayPoint') {
    // Set a default title for midway points.
    view3dUpdateOverviewTip(Drupal.t('Go here'), x, y);
  }
  else {
    // Look up local cache for the title.
    var title = jQuery.data(document.body, "title_tip_"+id);
    if (title) {
      view3dUpdateOverviewTip(title, x, y);
    }
    else {
      // Ask the backend for a title.
      var viewerSettings = Drupal.settings.viewer3d;
      $.get(viewerSettings['path'] + '/ajax/title/' + id + '/0', function(data) {
        data = Drupal.parseJson(data);
        jQuery.data(document.body, 'title_tip_' + id, data.value);
        view3dUpdateOverviewTip(data.value, x, y);
      });
    }
  }
}

function view3dRotationCompleted(id) {

  // Info box, if requested else do ...
  if (viwer3dInfoShow) {
    var viewerSettings = Drupal.settings.viewer3d;
    var href = viewerSettings.path + '/ajax/info/' + id;

    // Lookup the local cache.
    var info = jQuery.data(document.body, "info_"+id);
    if (info) {
      $('#building-viewer-point-information .building-viewer-point-inner').html(info);
      viewerToggleOverlay();
      $('#building-viewer-point-information').fadeIn();
    }
    else {
      // Make ajax call to get extended information information about the point.
      $.get(href, function(data) {
        data = Drupal.parseJson(data);
        $('#building-viewer-point-information .building-viewer-point-inner').html(data.value);
        viewerToggleOverlay();
        $('#building-viewer-point-information').fadeIn();
        jQuery.data(document.body, 'info_'+id, data.value);
      });
    }
  }
}

function view3dMouseOutPoint(id) {

}
/***********************************
 * END OF MOVIE CALLBACK FUNCTIONS *
 ***********************************/

/*****************************
 * IMPLEMENTATION OF HELPERS *
 *****************************/
function view3dGetWMode() {
  return "opaque";
}

function view3dUpdateTitle(title) {
  // Update title.
  $('#building-viewer-point-title').html(title);

  // Bind click to the new link.
  $('#building-viewer-point-title a').click(function() {
    if (viewer3d_click) {
      viewer3d_click = false;
      viwer3dInfoShow = true;
      viewer3dRotateToDefaultDirection();
      return false;
    }
    return false;
  });

  // Remove old information.
  $('#building-viewer-point-information .building-viewer-point-inner').html('');
}

function view3dLoadInfoBox(href) {
}

function view3dUpdateTip(tip, x, y) {
  var point = $('#building-viewer-point-tip');
  $('a', point).qtip("api").updateContent(tip);
  view3dMoveTip(point, x, y);
}

function view3dUpdateOverviewTip(tip, x, y) {
  var overviewPoint = $('#building-viewer-overview-point-tip');
  $('a', overviewPoint).qtip("api").updateContent(tip);
  view3dMoveTip(overviewPoint, x, y);
}

function view3dMoveTip(point, x, y) {
  point.animate({
      top: (y - 10) + 'px',
      left: (x - 10) + 'px'
    },
    50
  );
}

// Used to prevent dlb click.
var viewer3d_click = true;

// Fix problem with rotation complete event and info box.
var viwer3dInfoShow = false;

// Toggle overlay, opt = show, hide
function viewerToggleOverlay(opt) {
  $('.building-viewer-overlay')
  .css('opacity', .5)
  .toggle(50, function() {
    viewer3d_click = true;
  });
}

function viewerToggleHelp() {
  $('#building-viewer-help').toggle();
  viewerToggleOverlay();
}

/******************
 * END OF HELPERS *
*******************/

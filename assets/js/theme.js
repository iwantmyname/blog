(function() {
  imgix.onready(function() {
    return imgix.fluid({
      updateOnResizeDown: true,
      updateOnPinchZoom: true,
      pixelStep: 100
    });
  });

}).call(this);

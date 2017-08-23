;(function($) {
  // multiple plugins can go here
  (function(pluginName) {
    var defaults = {
    };

    function initForm($elem, options) {
      var beforeSubmit = typeof(options.beforeSubmit)!='undefined' ? options.beforeSubmit : null;
      var success = typeof(options.success)!='undefined' ? options.success : null;
      var error = typeof(options.error)!='undefined' ? options.error : null;
      var progressEstimate = typeof(options.progressEstimate)!='undefined' && options.progressEstimate > 0 ? options.progressEstimate : 1;
      var $progressButton = $elem.find('.progress-button');
      
      var uiProgressButton = new UIProgressButton( $progressButton[0], { callback: function(instance) { } })
      $progressButton.data('ui-progress-button',uiProgressButton);

      var progressStep = 1.0 / (progressEstimate * 1000.0 / 100.0);
      console.log()
      var startLoading = function() {
        var progress = 0;
        var interval = setInterval( function() {
            progress = Math.min( progress + progressStep, 1 );
            uiProgressButton.setProgress(progress);
          }, 100 );
        $progressButton.data('progress-interval',interval);
      }

      var stopLoading = function() {
        var interval = $progressButton.data('progress-interval');
        if (interval) {
          clearInterval(interval);
          $progressButton.data('progress-interval',null);
        }
      }

      var extOptions = {
        beforeSubmit: function(formData, $form, options) {
          startLoading();
          if (beforeSubmit) {
            beforeSubmit(formData, $form, options);
          }
        },
        success: function(responseText, statusText, xhr, $form) {
          stopLoading();

          if (xhr.status!=200) {
            uiProgressButton.stop(-1);
          } else {
            if (typeof(responseText)=='object' && typeof(responseText.result)=='string' && responseText.result != 'OK') {
              uiProgressButton.stop(-1);
            } else {
              uiProgressButton.stop(1);
            }
          }

          if (success) {
            success(responseText, statusText, xhr, $form);
          }

        },
        error: function(xhr, statusText, errMessage, $form) {
          stopLoading();
          uiProgressButton.stop(-1);
          if (error) {
            error(xhr, statusText, errMessage, $form);
          }
        }
      }
      
      var finalOptions = $.extend({}, options, extOptions)
      $elem.ajaxForm(finalOptions); 

      
    }

    $.fn[pluginName] = function(options) {

      options = $.extend(true, {}, defaults, options);
            
      return this.each(function() {
        var elem = this,
          $elem = $(elem);

        initForm($elem, options);
      });
    };
    $.fn[pluginName].defaults = defaults;
  })('ajaxProgressForm');
})(jQuery);

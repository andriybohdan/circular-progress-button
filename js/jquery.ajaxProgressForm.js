;(function($) {
  // multiple plugins can go here
  (function(pluginName) {
    var defaults = {
      progressEstimate: 5, // Affects speed of progress change. Time in seconds for progress to reach 100%
      closeAnimation: 0.1,
      slowdownAfter: 3/4,
      timeoutSeconds: 30,
      slowdownSeconds: 10
    };

    function initForm($elem, options) {
      var beforeSubmit = typeof(options.beforeSubmit)!='undefined' ? options.beforeSubmit : null;
      var success = typeof(options.success)!='undefined' ? options.success : null;
      var error = typeof(options.error)!='undefined' ? options.error : null;
      var progressEstimate = typeof(options.progressEstimate)!='undefined' && options.progressEstimate > 0 ? options.progressEstimate : 5;
      var $progressButton = $elem.find('.progress-button');
      var closeAnimation = typeof(options.closeAnimation)!='undefined' ? options.closeAnimation : 0.1;
      
      var uiProgressButton = new UIProgressButton( $progressButton[0], { callback: function(instance) { } })
      $progressButton.data('ui-progress-button',uiProgressButton);


      var progressStep, progress, resultCode, slowdownStarted;
      var responseText, statusText, xhr, $form, errMessage;

      function calcSlowdownProgress() {
        var slowdownProgress = (1.0 - progress) / (options.slowdownSeconds * 1000.0/100.0);
        return Math.min(slowdownProgress, calcNormalProgress());
      }

      function calcNormalProgress() {
        return 1.0 / (progressEstimate * 1000.0 / 100.0);
      }

      function calcCloseProgress() {
        var closeProgress = (1.0 - progress) / (closeAnimation * 1000.0/100.0);
        return Math.max(closeProgress, calcNormalProgress());
      }

      function triggerCallbacks() {
        if (resultCode>=0) {
          if (success) {
            setTimeout(function() {
              success(responseText, statusText, xhr, $form);
            },300); // 300 harcoded in UIProgressButton.prototype.stop
          }
        } else {
          if (error) {
            setTimeout(function() {
              error(xhr, statusText, errMessage, $form);
            },300); // 300 harcoded in UIProgressButton.prototype.stop
          }
        }
      }

      var onProgressEnd = function() {
        var interval = $progressButton.data('progress-interval');
        if (interval) {
          clearInterval(interval);
          $progressButton.data('progress-interval',null);
          if (resultCode!=null) {
            uiProgressButton.stop(resultCode);
            triggerCallbacks();
          }
        }
      }

      var updateProgress = function() {
        progress = Math.min( progress + progressStep, 1 );
        uiProgressButton.setProgress(progress);

        if (progress>=1) {
          onProgressEnd();
        } else if (resultCode==null && progress >= options.slowdownAfter) {
          if (!slowdownStarted) {
            slowdownStarted = true;
            progressStep = calcSlowdownProgress();
          }
        }
      }
      var startLoading = function() {
        progress = 0;
        progressStep = calcNormalProgress();
        resultCode = null;
        responseText = null;
        statusText = null;
        slowdownStarted = false;
        xhr = null
        $form = null
        var interval = setInterval( updateProgress, 100 );
        $progressButton.data('progress-interval',interval);
      }

      var stopLoading = function(_resultCode) {
        resultCode = _resultCode;
        progressStep = calcCloseProgress();
      }

      var extOptions = {
        beforeSubmit: function(formData, $form, options) {
          startLoading();
          if (beforeSubmit) {
            beforeSubmit(formData, $form, options);
          }
        },
        success: function(_responseText, _statusText, _xhr, $_form) {
          responseText = _responseText
          statusText = _statusText
          xhr = _xhr
          $form = $_form
          if (xhr.status!=200) {
            stopLoading(-1);
          } else {
            if (typeof(responseText)=='object' && typeof(responseText.result)=='string' && responseText.result != 'OK') {
              stopLoading(-1);
            } else {
              stopLoading(1);
            }
          }

        },
        error: function(_xhr, _statusText, _errMessage, $_form) {
          statusText = _statusText
          xhr = _xhr
          $form = $_form
          errMessage = _errMessage

          stopLoading(-1);
        }
      }

      if (typeof(options.timeout)=='undefined') {
        options.timeout = options.timeoutSeconds * 1000;
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

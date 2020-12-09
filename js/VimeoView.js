define([
  'libraries/vimeo-player.min'
], function(Player) {

  return Backbone.View.extend({

    template: 'vimeoVideo',

    vimeoEvents: [
      'play',
      'pause',
      'ended',
      'timeupdate',
      'seeking',
      'seeked',
      'error',
      'loaded'
    ],

    className: 'vimeo__video',

    initialize: function() {
      this.setupPlayer();
      this.setupResponsiveSizing();
      this.setupEventListeners();
    },

    /**
     * Instantiate the vimeo player with the options supplied
     */
    setupPlayer: function() {
      var options = {
        url: this.model._source,
        autoplay: this.model._autoplay,
        loop: this.model._loop
      };

      this.player = new Player(this.el, options);
    },

    /**
     * Use the vimeo player's methods to determine the aspect ratio,
     * and set the padding on this view's element accordingly
     */
    setupResponsiveSizing: function() {
      var $el = this.$el;
      var player = this.player;
      var self = this;

      player
        .getVideoWidth()
        .then(function(width) {
          self.videoWidth = width;
          return player.getVideoHeight();
        })
        .then(function(height) {
          self.videoHeight = height;
          var ratio = self.videoHeight / self.videoWidth * 100;
          $el.css({ paddingTop: ratio + '%' });
          self.trigger('ready');
        });
    },

    /**
     * Trigger the vimeo player's events on this view so that it can act as an abstraction of the player
     * also set up inview listener for 'pause when offscreen', if that's been enabled
     */
    setupEventListeners: function() {
      this.vimeoEvents.forEach(function(eventType) {
        this.player.on(eventType, function(data) {
          this.trigger(eventType, {
            type: eventType,
            data: data
          });
        }.bind(this));
      }, this);

      if (!this.model._pauseWhenOffScreen) return;

      this.$el.on('inview.pauseWhenOffScreen', this.onPlayerInview.bind(this));
    },

    onPlayerInview: function(event, isInView) {
      if (isInView) return;
      this.player.getPaused().then(function(paused) {
        if (paused) return;
        this.player.pause();
      }.bind(this));
    },

    /**
     * Destroy the player instance before removal
     */
    remove: function() {
      if (this.model._pauseWhenOffScreen) this.$el.off('inview.pauseWhenOffScreen');

      try {
        this.player.destroy();
      } catch(e) {
        console.log(e)
      }

      Backbone.View.prototype.remove.call(this);
    }

  });

});

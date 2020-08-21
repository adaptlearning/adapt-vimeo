define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/models/componentModel',
  './VimeoView',
  './TranscriptView'
], function(Adapt, ComponentView, ComponentModel, VimeoView, TranscriptView) {

  var COMPLETION = ENUM([
    'INVIEW',
    'PLAY',
    'ENDED'
  ], function(value) {
    return (typeof value === 'string') ? value.toUpperCase() : value;
  });

  var Vimeo = ComponentView.extend({

    events: {
      "click .js-skip-to-transcript": "onSkipToTranscript"
    },

    postRender: function() {
      this.$widget = this.$('.component__widget');
      this.setupPlayer();
      this.setupTranscript();
      this.setupEventListeners();
    },

    /**
     * Setup the vimeo view and player instance
     */
    setupPlayer: function() {
      this.vimeoView = this.addSubview(VimeoView, this.model.get('_media'));

      this.listenToOnce(this.vimeoView, 'ready', this.setReadyStatus);
    },

    /**
     * Render the transcript and setup the completion event if configured
     */
    setupTranscript: function() {
      var transcriptConfig = this.model.get('_transcript') || {};

      if (!transcriptConfig._inlineTranscript && !transcriptConfig._externalTranscript) {
        return;
      }

      this.transcriptView = this.addSubview(TranscriptView, transcriptConfig);

      if (transcriptConfig._setCompletionOnView) {
        this.listenToOnce(this.transcriptView, 'transcript:open', this.setCompletionStatus);
      }
    },

    setupEventListeners: function() {
      this.listenTo(this.vimeoView, {
        play: this.handleMediaEvent,
        pause: this.handleMediaEvent,
        ended: this.handleMediaEvent
      });

      var completionEvent = COMPLETION(this.model.get('_setCompletionOn')) || COMPLETION.PLAY;

      if (completionEvent === COMPLETION.INVIEW) {
        return this.setupInviewCompletion('.component__widget', this.setCompletionStatus);
      }

      this.listenToOnce(this.vimeoView, completionEvent.asLowerCase, this.setCompletionStatus);
    },

    /**
     * Add a sub view to this component's widget element
     * @param {Backbone.View} constructor
     * @param {object} model - the data to pass as the view's model
     * @returns {Backbone.View}
     */
    addSubview: function(constructor, model) {
      var view = new constructor({ model: model});
      this.$widget.append(view.$el);
      return view;
    },

    onSkipToTranscript: function() {
      this.$('.vimeo__transcript-btn').a11y_focus();
    },

    /**
     * Filter rapidly firing events so that only meaningful 'media' events are triggered
     * @param {object} event
     */
    handleMediaEvent: function(event) {
      var eventType = event.type;
      var rapidFireTimeoutWindow = 500;

      var currentTime = Date.now();
      var lastEventTime = this.lastEventTime || 0;
      this.lastEventTime = currentTime;

      clearTimeout(this.waitingTriggerTimeout);

      var isAlwaysTriggered = (eventType === 'ended');
      if (isAlwaysTriggered) {
        return this.triggerGlobalEvent(eventType);
      }

      var lastEventDuration = (currentTime - lastEventTime);
      var isRapidlyFiring = (lastEventDuration <= rapidFireTimeoutWindow);
      if (isRapidlyFiring) return;

      // Wait for rapidFireTimeoutWindow until triggering
      // Allows trigger to be dropped if another incoming event arrives
      var trigger = this.triggerGlobalEvent.bind(this, eventType);
      this.waitingTriggerTimeout = setTimeout(trigger, rapidFireTimeoutWindow);
    },

    /**
     * Trigger a global 'media' event
     * @param {string} eventType
     */
    triggerGlobalEvent: function(eventType) {
      Adapt.trigger('media', {
        isVideo: true,
        type: eventType,
        src: this.model.get('_media')._source,
        platform: 'Vimeo'
      });
    },

    /**
     * Remove this view and sub views. Destroys the vimeo player instance
     */
    remove: function() {
      this.vimeoView.remove();
      this.transcriptView && this.transcriptView.remove();
      ComponentView.prototype.remove.call(this);
    }

  });

  return Adapt.register('vimeo', {
    model: ComponentModel.extend({}), // create a new class in the inheritance chain so it can be extended per component type if necessary later
    view: Vimeo
  });

});

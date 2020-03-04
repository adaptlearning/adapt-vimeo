define([
  'core/js/adapt'
], function(Adapt) {

  return Backbone.View.extend({

    isOpen: false,

    template: 'vimeoTranscript',

    className: 'media-transcript-container',

    events: {
      'click .media-inline-transcript-button': 'onToggleInlineTranscript',
      'click .media-external-transcript-button': 'onExternalTranscriptClicked',
      'click .js-skip-to-transcript': 'onSkipToTranscript'
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      var template = Handlebars.templates[this.template];
      this.$el.html(template(this.model));
    },

    onSkipToTranscript: function() {
      this.$('.media-transcript-container button').a11y_focus();
    },

    /**
     * Toggle opening and closing the transcript
     * @param {Event} event
     */
    onToggleInlineTranscript: function(event) {
      event && event.preventDefault();

      var $transcriptBodyContainer = this.$('.media-inline-transcript-body-container');
      var $button = this.$('.media-inline-transcript-button');
      var $buttonText = this.$('.media-inline-transcript-button .transcript-text-container');
      var slide = 'slideDown';
      var text = this.model.inlineTranscriptCloseButton;

      this.isOpen = !this.isOpen;

      if (!this.isOpen) {
        slide = 'slideUp';
        text = this.model.inlineTranscriptButton
      }

      $transcriptBodyContainer.stop(true, true)[slide](function() {
        Adapt.trigger('device:resize');
      });
      $button.attr('aria-expanded', this.isOpen);
      $buttonText.html(text);

      this.trigger('transcript:open');
    },

    /**
     * Trigger the 'transcript:open' event when the external transcript button is clicked
     * @param event
     */
    onExternalTranscriptClicked: function(event) {
      this.trigger('transcript:open');
    }

  });

});

define([
  'core/js/adapt'
], function(Adapt) {

  return Backbone.View.extend({

    isOpen: false,

    template: 'vimeoTranscript',

    className: 'vimeo__transcript-container',

    events: {
      'click .js-vimeo-inline-transcript-toggle': 'onToggleInlineTranscript',
      'click .js-vimeo-external-transcript-click': 'onExternalTranscriptClicked',
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
      this.$('.vimeo__transcript-btn').a11y_focus();
    },

    /**
     * Toggle opening and closing the transcript
     * @param {Event} event
     */
    onToggleInlineTranscript: function(event) {
      event && event.preventDefault();

      var $transcriptBodyContainer = this.$('.vimeo__transcript-body-inline');
      var $button = this.$('.vimeo__transcript-btn-inline');
      var $buttonText = this.$('.youtube__transcript-btn-text');
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

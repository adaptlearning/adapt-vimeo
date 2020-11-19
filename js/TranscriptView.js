define([
  'core/js/adapt'
], function(Adapt) {

  return Backbone.View.extend({

    isOpen: false,

    template: 'vimeoTranscript',

    className: 'vimeo__transcript-container',

    events: {
      'click .js-vimeo-inline-transcript-toggle': 'onToggleInlineTranscript',
      'click .js-vimeo-external-transcript-click': 'onExternalTranscriptClicked'
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      var template = Handlebars.templates[this.template];
      this.$el.html(template(this.model));
    },

    /**
     * Handles toggling the inline transcript open/closed
     * and updating the label on the inline transcript button
     */
    onToggleInlineTranscript: function() {
      var $transcriptBodyContainer = this.$('.vimeo__transcript-body-inline');
      var $button = this.$('.vimeo__transcript-btn-inline');
      var $buttonText = $button.find('.vimeo__transcript-btn-text');
      var slide = 'slideDown';
      var text = this.model.inlineTranscriptCloseButton;

      this.isOpen = !this.isOpen;

      if (!this.isOpen) {
        slide = 'slideUp';
        text = this.model.inlineTranscriptButton;
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

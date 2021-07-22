import Adapt from 'core/js/adapt';

export default class TranscriptView extends Backbone.View {

  get template() {
    return 'vimeoTranscript';
  }

  className() {
    return 'vimeo__transcript-container';
  }

  events() {
    return {
      'click .js-vimeo-inline-transcript-toggle': 'onToggleInlineTranscript',
      'click .js-vimeo-external-transcript-click': 'onExternalTranscriptClicked'
    };
  }

  initialize() {
    this.isOpen = false;
    this.render();
  }

  render() {
    const template = Handlebars.templates[this.template];
    this.$el.html(template(this.model));
  }

  /**
   * Handles toggling the inline transcript open/closed
   * and updating the label on the inline transcript button
   */
  onToggleInlineTranscript() {
    const $transcriptBodyContainer = this.$('.vimeo__transcript-body-inline');
    const $button = this.$('.vimeo__transcript-btn-inline');
    const $buttonText = $button.find('.vimeo__transcript-btn-text');
    let slide = 'slideDown';
    let text = this.model.inlineTranscriptCloseButton;

    this.isOpen = !this.isOpen;

    if (!this.isOpen) {
      slide = 'slideUp';
      text = this.model.inlineTranscriptButton;
    }

    $transcriptBodyContainer.stop(true, true)[slide](() => {
      Adapt.trigger('device:resize');
    });
    $button.attr('aria-expanded', this.isOpen);
    $buttonText.html(text);

    this.trigger('transcript:open');
  }

  /**
   * Trigger the 'transcript:open' event when the external transcript button is clicked
   * @param event
   */
  onExternalTranscriptClicked(event) {
    this.trigger('transcript:open');
  }

}
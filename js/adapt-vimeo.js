import Adapt from 'core/js/adapt';
import ComponentView from 'core/js/views/componentView';
import ComponentModel from 'core/js/models/componentModel';
import VimeoView from './VimeoView';
import TranscriptView from './TranscriptView';
import COMPLETION from './completionEnum';

class Vimeo extends ComponentView {

  events() {
    return {
      'click .js-skip-to-transcript': 'onSkipToTranscript'
    };
  }

  postRender() {
    this.$widget = this.$('.component__widget');
    this.setupPlayer();
    this.setupTranscript();
    this.setupEventListeners();
  }

  /**
   * Setup the vimeo view and player instance
   */
  setupPlayer() {
    this.vimeoView = this.addSubview(VimeoView, this.model.get('_media'));

    this.listenToOnce(this.vimeoView, 'ready', this.setReadyStatus);
  }

  /**
   * Render the transcript and setup the completion event if configured
   */
  setupTranscript() {
    const transcriptConfig = this.model.get('_transcript') || {};

    if (!transcriptConfig._inlineTranscript && !transcriptConfig._externalTranscript) {
      return;
    }

    this.transcriptView = this.addSubview(TranscriptView, transcriptConfig);

    if (!transcriptConfig._setCompletionOnView) return;
    this.listenToOnce(this.transcriptView, 'transcript:open', this.setCompletionStatus);
  }

  setupEventListeners() {
    this.listenTo(this.vimeoView, {
      play: this.handleMediaEvent,
      pause: this.handleMediaEvent,
      ended: this.handleMediaEvent
    });

    const completionEvent = COMPLETION(this.model.get('_setCompletionOn')) || COMPLETION.PLAY;

    if (completionEvent === COMPLETION.INVIEW) {
      return this.setupInviewCompletion('.component__widget', this.setCompletionStatus);
    }

    this.listenToOnce(this.vimeoView, completionEvent.asLowerCase, this.setCompletionStatus);
  }

  /**
   * Add a sub view to this component's widget element
   * @param {Backbone.View} constructor
   * @param {object} model - the data to pass as the view's model
   * @returns {Backbone.View}
   */
  addSubview(constructor, model) {
    const view = new constructor({ model });
    this.$widget.append(view.$el);
    return view;
  }

  onSkipToTranscript() {
    Adapt.a11y.focusFirst(this.$('.vimeo__transcript-btn'));
  }

  /**
   * Filter rapidly firing events so that only meaningful 'media' events are triggered
   * @param {object} event
   */
  handleMediaEvent(event) {
    const eventType = event.type;
    const rapidFireTimeoutWindow = 500;

    const currentTime = Date.now();
    const lastEventTime = this.lastEventTime || 0;
    this.lastEventTime = currentTime;

    clearTimeout(this.waitingTriggerTimeout);

    const isAlwaysTriggered = (eventType === 'ended');
    if (isAlwaysTriggered) {
      return this.triggerGlobalEvent(eventType);
    }

    const lastEventDuration = (currentTime - lastEventTime);
    const isRapidlyFiring = (lastEventDuration <= rapidFireTimeoutWindow);
    if (isRapidlyFiring) return;

    // Wait for rapidFireTimeoutWindow until triggering
    // Allows trigger to be dropped if another incoming event arrives
    const trigger = this.triggerGlobalEvent.bind(this, eventType);
    this.waitingTriggerTimeout = setTimeout(trigger, rapidFireTimeoutWindow);
  }

  /**
   * Trigger a global 'media' event
   * @param {string} eventType
   */
  triggerGlobalEvent(eventType) {
    Adapt.trigger('media', {
      isVideo: true,
      type: eventType,
      src: this.model.get('_media')._source?.trim(),
      platform: 'Vimeo'
    });
  }

  /**
   * Remove this view and sub views. Destroys the vimeo player instance
   */
  remove() {
    this.vimeoView.remove();
    this.transcriptView && this.transcriptView.remove();
    super.remove();
  }

};

export default Adapt.register('vimeo', {
  model: ComponentModel.extend({}), // create a new class in the inheritance chain so it can be extended per component type if necessary later
  view: Vimeo
});

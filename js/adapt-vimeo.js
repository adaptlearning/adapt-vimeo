import a11y from 'core/js/a11y';
import Adapt from 'core/js/adapt';
import ComponentView from 'core/js/views/componentView';
import ComponentModel from 'core/js/models/componentModel';
import VimeoView from './VimeoView';
import COMPLETION from './completionEnum';
import components from 'core/js/components';

class Vimeo extends ComponentView {

  preRender() {
    _.bindAll(this, 'onToggleInlineTranscript', 'onExternalTranscriptClicked', 'onSkipToTranscript');

    const _transcript = this.model.get('_transcript');

    this.model.set({
      _isInlineTranscriptOpen: false,
      _hasTranscript: _transcript?._inlineTranscript || _transcript?._externalTranscript,
      transcriptRegionLabel: _transcript?.inlineTranscriptButton || _transcript?.transcriptLink,
      inlineButtonText: _transcript?.inlineTranscriptButton || _transcript?.transcriptLink
    });
  }

  postRender() {
    this.$widget = this.$('.component__widget');
    this.setupPlayer();
    this.setupEventListeners();
  }

  /**
   * Setup the vimeo view and player instance
   */
  setupPlayer() {
    this.vimeoView = this.addSubview(VimeoView, this.model.get('_media'));

    this.listenToOnce(this.vimeoView, 'ready', this.onVimeoViewReady);
  }

  onVimeoViewReady() {
    this.setIframeAccessibleName();
    this.setReadyStatus();
  }

  /**
   * Give the player iframe an author-controlled, localisable accessible name.
   * The Vimeo library otherwise only sets a `title` from the video's own
   * Vimeo title, which authors cannot control or localise.
   *
   * Uses the displayTitle (or title) text rather than referencing the visible
   * heading, as the heading also carries the completion status. The ariaLabel
   * global wraps it (e.g. "Video: {{title}}") so the frame is identified as a
   * video. With no title, Vimeo's own title is left in place.
   */
  setIframeAccessibleName() {
    const iframe = this.vimeoView.player?.element;
    if (!iframe) return;
    const data = this.model.toJSON();
    const title = Handlebars.helpers.compile_a11y_normalize(data.displayTitle || data.title, data);
    if (!title) return;
    const ariaLabel = Adapt.course.get('_globals')?._components?._vimeo?.ariaLabel;
    const name = Handlebars.helpers.compile_a11y_normalize(ariaLabel, { ...data, title }) || title;
    iframe.setAttribute('aria-label', name);
    iframe.setAttribute('title', name);
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

  onSkipToTranscript(event) {
    // need slight delay before focussing button to make it work when JAWS is running
    // see https://github.com/adaptlearning/adapt_framework/issues/2427
    _.delay(() => {
      a11y.focus(this.$('.vimeo__transcript-btn'));
    }, 250);
  }

  /**
   * Handles toggling the inline transcript open/closed
   * and updating the label on the inline transcript button
   */
  onToggleInlineTranscript(event) {
    if (event) event.preventDefault();
    const isOpen = this.model.get('_isInlineTranscriptOpen');
    const _transcript = this.model.get('_transcript');
    this.model.set({
      _isInlineTranscriptOpen: !isOpen,
      inlineButtonText: isOpen
        ? (_transcript?.inlineTranscriptButton || _transcript?.transcriptLink)
        : _transcript?.inlineTranscriptCloseButton
    });

    const $transcriptBodyContainer = this.$('.vimeo__transcript-body-inline').stop(true, true);
    if (isOpen) {
      $transcriptBodyContainer.slideUp(() => $(window).resize());
    } else {
      $transcriptBodyContainer.slideDown(() => $(window).resize());
    }

    this.transcriptTriggers(isOpen ? 'closed' : 'opened');
  }

  onExternalTranscriptClicked(event) {
    window.open(this.model.get('_transcript').transcriptLink);
    this.transcriptTriggers('external');
  }

  transcriptTriggers(state) {
    const setCompletionOnView = this.model.get('_transcript')._setCompletionOnView;
    const isComplete = this.model.get('_isComplete');
    const shouldComplete = (setCompletionOnView && !isComplete);

    if (!shouldComplete) {
      return Adapt.trigger('vimeo:transcript', state, this);
    }
    this.setCompletionStatus();
    Adapt.trigger('vimeo:transcript', 'complete', this);
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

Vimeo.template = 'vimeo.jsx';

export default components.register('vimeo', {
  model: ComponentModel.extend({}), // create a new class in the inheritance chain so it can be extended per component type if necessary later
  view: Vimeo
});

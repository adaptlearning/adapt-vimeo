import Player from 'libraries/vimeo-player.min';

export default class VimeoView extends Backbone.View {

  get template() {
    return 'vimeoVideo';
  }

  className() {
    return 'vimeo__video';
  }

  initialize() {
    this.vimeoEvents = [
      'play',
      'pause',
      'ended',
      'timeupdate',
      'seeking',
      'seeked',
      'error',
      'loaded'
    ];

    this.setupPlayer();
    this.setupResponsiveSizing();
    this.setupEventListeners();
  }

  /**
   * Instantiate the vimeo player with the options supplied
   */
  setupPlayer() {
    const options = {
      url: this.model._source?.trim(),
      autoplay: this.model._autoplay,
      loop: this.model._loop
    };

    this.player = new Player(this.el, options);
  }

  /**
   * Use the vimeo player's methods to determine the aspect ratio,
   * and set the padding on this view's element accordingly
   */
  async setupResponsiveSizing() {
    const videoWidth = await this.player.getVideoWidth();
    const videoHeight = await this.player.getVideoHeight();
    this.$el.css('padding-top', `${videoHeight / videoWidth * 100}%`);
    this.trigger('ready');
  }

  /**
   * Trigger the vimeo player's events on this view so that it can act as an abstraction of the player
   * also set up inview listener for 'pause when offscreen', if that's been enabled
   */
  setupEventListeners() {
    this.vimeoEvents.forEach(eventType => {
      this.player.on(eventType, data => {
        this.trigger(eventType, {
          type: eventType,
          data: data
        });
      });
    });

    if (!this.model._pauseWhenOffScreen) return;

    this.$el.on('inview.pauseWhenOffScreen', this.onPlayerInview.bind(this));
  }

  onPlayerInview(event, isInView) {
    if (isInView) return;
    this.player.getPaused().then(paused => !paused && this.player.pause());
  }

  /**
   * Destroy the player instance before removal
   */
  remove() {
    if (this.model._pauseWhenOffScreen) this.$el.off('inview.pauseWhenOffScreen');

    try {
      this.player.destroy();
    } catch (e) {
      console.log(e);
    }

    super.remove();
  }

}

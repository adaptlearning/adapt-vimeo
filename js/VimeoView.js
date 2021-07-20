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
      url: this.model._source,
      autoplay: this.model._autoplay,
      loop: this.model._loop
    };

    this.player = new Player(this.el, options);
  }

  /**
   * Use the vimeo player's methods to determine the aspect ratio,
   * and set the padding on this view's element accordingly
   */
  setupResponsiveSizing() {
    const $el = this.$el;
    const player = this.player;
    const self = this;

    player
      .getVideoWidth()
      .then(width => {
        self.videoWidth = width;
        return player.getVideoHeight();
      })
      .then(height => {
        self.videoHeight = height;
        const ratio = self.videoHeight / self.videoWidth * 100;
        $el.css({ paddingTop: ratio + '%' });
        self.trigger('ready');
      });
  }

  /**
   * Trigger the vimeo player's events on this view so that it can act as an abstraction of the player
   * also set up inview listener for 'pause when offscreen', if that's been enabled
   */
  setupEventListeners() {
    this.vimeoEvents.forEach(eventType => {
      this.player.on(eventType, (data) => {
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
    this.player.getPaused().then(paused => {
      if (paused) return;
      this.player.pause();
    });
  }

  /**
   * Destroy the player instance before removal
   */
  remove() {
    if (this.model._pauseWhenOffScreen) this.$el.off('inview.pauseWhenOffScreen');

    try {
      this.player.destroy();
    } catch(e) {
      console.log(e)
    }

    super.remove();
  }

}

const COMPLETION = ENUM([
  'INVIEW',
  'PLAY',
  'ENDED'
], value => value?.toUpperCase?.());

export default COMPLETION;

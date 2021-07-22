
const COMPLETION_STATE = ENUM([
  'INVIEW',
  'PLAY',
  'ENDED'
], value => value?.toUpperCase?.());
  
export default COMPLETION_STATE;
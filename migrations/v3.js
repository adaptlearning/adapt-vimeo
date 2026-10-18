import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getCourse, testStopWhere, testSuccessWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('adapt-vimeo - v3.5.1 to v3.5.2', async () => {
  let course;

  whereFromPlugin('adapt-vimeo - from v3.5.1', { name: 'adapt-vimeo', version: '<3.5.2' });

  whereContent('adapt-vimeo - where course has flat _globals._vimeo', async content => {
    course = getCourse();
    return _.has(course, '_globals._vimeo');
  });

  mutateContent('adapt-vimeo - move _globals._vimeo to _globals._components._vimeo', async content => {
    const flat = course._globals._vimeo;
    const nested = _.get(course, '_globals._components._vimeo', {});
    _.set(course, '_globals._components._vimeo', { ...nested, ...flat });
    delete course._globals._vimeo;
    return true;
  });

  checkContent('adapt-vimeo - check _globals._vimeo has moved', async content => {
    if (_.has(course, '_globals._vimeo')) throw new Error('adapt-vimeo - _globals._vimeo still present');
    if (!_.has(course, '_globals._components._vimeo')) throw new Error('adapt-vimeo - _globals._components._vimeo missing');
    return true;
  });

  updatePlugin('adapt-vimeo - update to v3.5.2', { name: 'adapt-vimeo', version: '3.5.2', framework: '>=5.19.1' });

  testSuccessWhere('flat _globals._vimeo only', {
    fromPlugins: [{ name: 'adapt-vimeo', version: '3.5.1' }],
    content: [
      { _id: 'c-100', _component: 'vimeo' },
      { _type: 'course', _globals: { _vimeo: { skipToTranscript: 'Go to transcript' } } }
    ]
  });

  testSuccessWhere('flat and nested _globals._vimeo, flat wins', {
    fromPlugins: [{ name: 'adapt-vimeo', version: '3.5.1' }],
    content: [
      { _id: 'c-100', _component: 'vimeo' },
      {
        _type: 'course',
        _globals: {
          _vimeo: { skipToTranscript: 'Go to transcript' },
          _components: { _vimeo: { skipToTranscript: 'Skip to transcript', ariaLabel: 'Video: {{title}}' } }
        }
      }
    ]
  });

  testStopWhere('nested _globals._components._vimeo only', {
    fromPlugins: [{ name: 'adapt-vimeo', version: '3.5.1' }],
    content: [
      { _id: 'c-100', _component: 'vimeo' },
      { _type: 'course', _globals: { _components: { _vimeo: { skipToTranscript: 'Skip to transcript' } } } }
    ]
  });

  testStopWhere('no _globals', {
    fromPlugins: [{ name: 'adapt-vimeo', version: '3.5.1' }],
    content: [
      { _id: 'c-100', _component: 'vimeo' },
      { _type: 'course' }
    ]
  });

  testStopWhere('plugin absent', {
    fromPlugins: [{ name: 'adapt-contrib-text', version: '1.0.0' }],
    content: [
      { _type: 'course', _globals: { _vimeo: { skipToTranscript: 'Go to transcript' } } }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-vimeo', version: '3.5.2' }]
  });
});

import React from 'react';
import { classes, compile, templates } from 'core/js/reactHelpers';

function VimeoWidget() {
  return (
    <div className='component__widget vimeo__widget' />
  );
}

// Never re-render: the Vimeo player SDK owns this element's children (its iframe)
const MemoVimeoWidget = React.memo(VimeoWidget, () => true);

export default function Vimeo(props) {
  const vimeoGlobals = props._globals?._components?._vimeo;
  const {
    _transcript,
    _isInlineTranscriptOpen,
    _hasTranscript,
    inlineButtonText,
    transcriptRegionLabel,
    onToggleInlineTranscript,
    onExternalTranscriptClicked,
    onSkipToTranscript
  } = props;

  return (
    <div className='component__inner vimeo__inner'>

      <templates.header {...props} />

      {_hasTranscript &&
        <button
          className='btn-text vimeo__skip-to-transcript js-skip-to-transcript'
          onClick={onSkipToTranscript}
        >
          {vimeoGlobals?.skipToTranscript}
        </button>
      }

      <MemoVimeoWidget />

      {_transcript &&
        <div className='vimeo__transcript-container'>

          {_transcript._inlineTranscript &&
            <button
              className='vimeo__transcript-btn vimeo__transcript-btn-inline js-vimeo-inline-transcript-toggle'
              onClick={onToggleInlineTranscript}
              aria-expanded={!!_isInlineTranscriptOpen}
            >
              <span
                className='vimeo__transcript-btn-text'
                dangerouslySetInnerHTML={{ __html: compile(inlineButtonText || '') }}
              />
              <span className='vimeo__transcript-btn-icon'>
                <span className='icon' aria-hidden='true' />
              </span>
            </button>
          }

          {_transcript._externalTranscript &&
            <button
              className='vimeo__transcript-btn vimeo__transcript-btn-external js-vimeo-external-transcript-click'
              onClick={onExternalTranscriptClicked}
            >
              <span
                className='vimeo__transcript-btn-text'
                dangerouslySetInnerHTML={{ __html: compile(_transcript.transcriptLinkButton || _transcript.transcriptLink || '') }}
              />
              <span className='vimeo__transcript-btn-icon'>
                <span className='icon' aria-hidden='true' />
              </span>
            </button>
          }

          {_transcript._inlineTranscript &&
            <div
              className={classes([
                'vimeo__transcript-body-inline',
                _isInlineTranscriptOpen && 'inline-transcript-open'
              ])}
              role='region'
              aria-label={transcriptRegionLabel}
            >
              <div
                className='vimeo__transcript-body-inline-inner'
                dangerouslySetInnerHTML={{ __html: compile(_transcript.inlineTranscriptBody || '', props) }}
              />
            </div>
          }

        </div>
      }

    </div>
  );
}

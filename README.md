# adapt-vimeo

**Adapt Vimeo** is a *presentation component* for the Adapt Framework.

## Installation

TBC

## Settings Overview

The attributes listed below are used in *components.json* to configure **Adapt Vimeo Player**, and are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-vimeo/example.json).

### Attributes

[**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. [Read more](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes).

**_component** (string): This value must be: `vimeo`.

**_classes** (string): CSS class name to be applied to **Vimeo** containing `div`. The class must be predefined in one of the Less files. Separate multiple classes with a space.

**_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left` or `right`.

**instruction** (string): This optional text appears above the component. It is frequently used to
guide the learner’s interaction with the component.

**_setCompletionOn** (string): This determines when Adapt will register this component as having been completed by the user. Acceptable values are `inview` (triggered when the component is fully displayed within the viewport), `play` (triggered when playback is initiated), or `ended` (triggered when the video has reached the end of playback). 


**_media** (object): The media configuration, containing values for **_source**, **_autoplay**, **_loop** and **_pauseWhenOffScreen**

>**_source** (string): The URL of the Vimeo video. This can be a direct link or an embed link

>**_autoplay** (boolean): Attempt to autoplay the view. Not supported in all browsers

>**_loop** (boolean): Automatically restart the video when it reaches the end

>**_pauseWhenOffScreen** (boolean): If set to `true`, pause playback when video is no longer in view. The default is `false`.


**_transcript** (object):  The transcript attributes group contains values for **_inlineTranscript**, **_externalTranscript**, **inlineTranscriptButton**, **inlineTranscriptCloseButton**, **inlineTranscriptBody**, **transcriptLinkButton**, and **transcriptLink**.

>**_setCompletionOnView** (boolean): This determines if Adapt will register this component as having been completed by the user when the inline transcript is opened. This is true by default.

>**_inlineTranscript** (boolean): Determines whether the button that toggles the display of the inline transcript text will be displayed or not. 

>**_externalTranscript** (boolean): Determines whether the button that links to the optional external transcript will be displayed or not.

>**inlineTranscriptButton** (string): This text appears on the button that toggles the visibility of the inline transcript text. It is displayed when the inline transcript text is hidden. If no text is provided, the **transcriptLink** will be displayed on the button.

>**inlineTranscriptCloseButton** (string): This text appears on the button that toggles the visibility of the inline transcript. It is displayed when the inline transcript text is visible. 

>**inlineTranscriptBody** (string): This optional text appears below the video. If provided, its visibility is toggled by clicking the transcript button. It is hidden by default.

>**transcriptLinkButton** (string): This text appears on the button that links to the optional external transcript. If no text is provided, the **transcriptLink** will be displayed on the button.

>**transcriptLink** (string): File name (including path) of the optional external transcript. Path should be relative to the *src* folder (e.g., *course/en/pdf/video01_transcript.pdf*).  


### Accessibility

### Limitations

No known limitations

----------------------------
**Version number:** 2.2.1  
**Framework versions:** 5.8.0  
**Author / maintainer:** Adapt Core Team with [contributors](https://github.com/adaptlearning/adapt-vimeo/graphs/contributors)  

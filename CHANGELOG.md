# Changes

## 0.1.6

Initial commit

## 0.1.7

- Added new method: `updateChapId()` to update `options.chapters.chapId` and `options.xhr.content.url` for each request.
- Fixed issue while saving ePub.
- Added 3 callback events:
  - `chapIdUpdated`: Fires when `options.chapters.chapId` updated. (_params: options_)
  - `beforeSave`: Fires before saveAs() executed. (_params: that_)
  - `complete`: Fires after ePub file saved to local. (_params: that_)

## 0.1.8

- Fixed issue when click to download button during the process (`saveEbook()` missing agrs)
- Added new callback event:
  - `processEbook`: Fires at the same time with `releaseTheKraken()`. (_params: self_)

## 0.1.9

- Fixed undefined ebook file name (`options.processing.ebookFileName`)

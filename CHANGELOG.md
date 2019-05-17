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

## 0.1.10

- Refactored the code to the more flexible and extensible way:
  - AJAX part to getting chap list content in download callback function move to `getListOfChapters()`.
  - Split `getContent()` code into 2 new methods added: `updateChapTitle()` & `parseChapterContent()`.
  - `downloadError()` now has 2 new agruments which allows retry download if needed.
  - `parseHtml()` renamed to `cleanupHtml()`.
  - Removed `generateUUID()` method.
  - Added `finaliseEpub()` into `saveEbook()`, this method will:
    - Fetch cover image and added BLOB data to `this.jepub`.
    - Generate ePub file (`generateEpub()`).
- Rename callback events:
  - `beforeSave` -> `beforeCreateEpub` (executed before `this.jepub.generate()` runs).
- Added new callback events:
  - `chapTitleUpdated`: Fires when `options.chapters.chapId` updated. (_params: this_)

## 0.1.11

- Update callback event param:
  - `chapTitleUpdated`: this - current JS object & chapNum - current chapter number

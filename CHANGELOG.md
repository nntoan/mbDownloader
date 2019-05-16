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
